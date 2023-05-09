const Product = require('../models/productModel');
const asyncErrorHandler = require('../middlewares/asyncErrorHandler');
const ErrorHandler = require('../utils/errorHandler');
const cloudinary = require('cloudinary');
const { isBuffer } = require('util');

exports.getAllProducts = asyncErrorHandler(async (req,res, next) => {
    const resultPerPage = 12;
    const productsCount = await Product.countDocuments();

    const searchFeature = new SearchFeatures(Product.find(),req.query)
    .search()
    .filter();

    let products = await searchFeature.query;
    let filteredProductsCount = products.length;
     searchFeature.pagination(resultPerPage);

     products = await searchFeature.query.clone();

     res.status(200).json({
        success: true,
        products,
        productsCount,
        resultPerPage,
        filteredProductsCount,
     });
});

exports.getProducts = asyncErrorHandler(async (req, res, next) => {
    const products = await Product.find();
    res.status(200).json({
        success: true,
        products,
    });
});

exports.getProductDetails = asyncErrorHandler(async (req, res, next) => {
    const product = await Product.findById(req.params.id);
    if(!product){
        return next(new ErrorHandler("Product Not Found", 404));
    }
    res.status(200).json({
        success: true,
        product,
    });
});

exports.getAdminProducts = asyncErrorHandler(async (req,res,next)=>{
    const products = await Product.find();
    res.status(200).json({
        success: true,
        products,
    });
});

exports.createProduct = asyncErrorHandler(async (req,res,next)=>{
    let images = [];
    if(typeof req.body.images == "string"){
        images.push(req.body.images);
    } else{
        images = req.body.images;
    }

    const imagesLink = [];
    for(let i = 0; i < images.length; i++){
        const result = await cloudinary.v2.uploader.upload(images[i], {
            folder: "products",
        });

        imagesLink.push({
            public_id: result.public_id,
            url: result.secure_url,
        });
    }

    const result = await cloudinary.v2.uploader.upload(req.body.logo, {
        folder : "brands",
    });

    const brandLogo = {
        public_id: result.public_id,
        url: result.secure_url,
    };

    req.body.brand = {
        name: req.body.brandname,
        logo: brandLogo,
    }
    req.body.images = imagesLink;
    req.body.user = req.user.id;

    let specs = [];
    req.body.specifications.forEach((s)=>{
        specs.push(JSON.parse(s))
    });
    req.body.specifications = specs;
    const product = await Product.create(req.body);
    res.status(2021).json({
        success: true,
        product
    });
});

exports.updateProduct = asyncErrorHandler(async (req, res, next)=>{
    let product = await Product.findById(req.params.id);
    if(!product){
        return next(new ErrorHandler("Product not found",404));
    }
    if(req.body.images !== undefined){
        let images = [];
        if(typeof req.body.images === "string"){
            images.push(req.body.images);
        } else{
            images = req.body.images;
        }
        for(let i = 0; i < product.images.length; i++){
            await cloudinary.v2.uploader.destroy(product.images[i].public_id);
        }

        const imagesLink = [];

        for(let i=0; i < images.length; i++){
            const result = await cloudinary.v2.uploader.upload(images[i], {
                folder: "products",
            });

            imagesLink.push({
                public_id: result.public_id,
                url: result.secure_url,
            });
        }
        req.body.images = imagesLink;
    }
    if( req.body.logo.length > 0){
        await cloudinary.v2.uploader.destroy(product.brand.logoo.public_id);
        const result = await cloudinary.v2.uploader.upload(req.body.logo, {
            folder: "brands",
        });
        const brandLogo = {
            public_id: result.public_id,
            url: result.secure_url,
        };

        req.body.brand = {
            name: req.body.brandname,
            logo: brandLogo,
        }
    }
    let specs = [];
    req.body.specifications.forEach((s)=>{
        specs.push(JSON.parse(s))
    });
    req.body.specifications = specs;
    req.body.user = req.user.id;

    product = await Product.findByIdAndUpdate(req.params.id, req.body, {
        new: true,
        runValidators: true,
        useFindAndModify: false,
    });
    res.status(201).json({
        success: true,
        product
    });
});

exports.deleteProduct = asyncErrorHandler(async (req, res, next)=>{
    const product = await Product.findById(req.params.id);
    if(!product){
        return next(new ErrorHandler("Product not found",404));
    }
    for(let i = 0; i < product.images.length; i++){
        await cloudinary.v2.uploader.destroy(product.images[i].public_id);
    }

    await product.remove();

    res.status(201).json({
        success: true
    });
});

exports.createProductReview = asyncErrorHandler(async (req,res,next)=>{
    const {rating, comment, productId} = req.body;
    const review = {
        user: req.user._id,
        name: req.user.name,
        rating: Number(rating),
        comment,
    }

    const product = await Product.findById(productId);

    if(!product){
        return next(new ErrorHandler("Product not found",404));
    }

    const isReviewed = product.reviews.find(review.user.toString() == req.user._id.toString());

    if(isReviewed){
        product.reviews.forEach((rev)=>{
            if(rev.user.toString() === req.user._id.toString())
            (rev.rating = rating, rev.comment = comment);
        });
    }else{
        product.reviews.push(review);
        product.numOfReviews = product.reviews.length;
    }

    let avg = 0;
    product.reviews.forEach((rev) => {
        avg +=  rev.rating;
    });

    product.ratings = avg / product.reviews.length;
    await product.save({validateBeforeSave : false});
    res.status(200).json({
        success: true,
    });
});

exports.getProductReviews = asyncErrorHandler(async (req,res,next) => {
    const product = await Product.findById(req.query.id);
    if(!product){
        return next(new ErrorHandler("Product Not Found",404));
    }
    res.status(200).json({
        success: true,
        reviews: product.reviews,
    });
});

exports.deleteReview = asyncErrorHandler(async (req,res,next)=>{
    const product = await Product.findById(req.query.productId);
    if(!product){
        return next(new ErrorHandler("Product Not Found",404));
    }
    const reviews = product.reviews.filter((rev)=>rev._id.toString() !== req.query.id.toString());
    let avg = 0;
    reviews.forEach((rev)=>{
        avg +=rev.rating;
    });
    let ratings = 0;
    if(reviews.length === 0 ){
        rating = 0;
    }else{
        rating = avg/reviews.length;
    } 
    const numOfReviews = review.length;
    await Product.findByIdAndUpdate(req.query.productId, {
        reviews,
        ratings: Number(ratings),
        numOfReviews,
    }, {
        new: true,
        runValidators: true,
        userFindAndModify: false,
    });
    res.status(200).json({
        success: true,
    });
});