const asyncErrorHandler = require('../middlewares/asyncErrorHandler');
const Order = require('../models/orderModel');
const Product = require('../models/productModel');
const ErrorHandler = require('../middlewares/error');
const sendEmail = require('../utils/sendEmail');

exports.newOrder = asyncErrorHandler(async(req,res,next)=>{
    const{shippingInfo, orderItems, paymentInfo, totalPrice} = req.body;
    const OrderExist = await Order.findOne({paymentInfo});
    if(OrderExist){
        return next(new ErrorHandler('Order already exists',400));
    }
    const order = await Order.create({
        shippingInfo,
        orderItems,
        paymentInfo,
        totalPrice,
        paidAt: Date.now(),
        user: req.user._id,
    });
    await sendEmail({
        email: req.user.email,
        tempelateId: process.env.SENDGRID_ORDER_TEMPELATED,
        data: {
            name: req.user.name,
            shippingInfo,
            orderItems,
            totalPrice,
            id: order._id,
        }
    });
    res.status(200).json({
        success: true,
        order,
    });
})

exports.getSingleOrderDetails = asyncErrorHandler(async (req,res,next) => {
    const order  = await Order.findById(req.params.id).populate("user", "name email");
    if(!order){
        return next(new ErrorHandler('Order not found',400));
    }
    res.status(200).json({
        success: true,
        order,
    });
});

exports.myOrders = asyncErrorHandler(async (req,res,next) => {
    const orders = await Order.find({user:req.user._id});
    if(!orders){
        return next(new ErrorHandler("Orders not found",404));
    }
    res.status(200).json({
        success: true,
        orders,
    });
});

exports.getAllOrder = asyncErrorHandler(async (req,res,next) => {
    const orders = await Order.find();
    if(!orders){
        return next(new ErrorHandler("Orders Not Found", 404));
    }
    let totalAmount = 0;
    orders.forEach(order => {
        totalAmount = totalAmount + order.totalPrice;
    });
    res.status(200).json({
        success:true,
        orders,
        totalAmount,
    });
});

exports.updateOrder = asyncErrorHandler(async (req,res,next)=>{
    const order = await Order.findById(req.params.id);
    if(!order){
        return next(new ErrorHandler("Order not found",404));
    }
    if(order.orderStatus === "Delieverd"){
        return next (new ErrorHandler("Already Delievered",400));
    }
    if(req.body.status === "Shipped"){
        ordershippedAt = Date.now();
        order.orderItems.forEach(async (i) => {
            await updateStock(i.product,i.quantity)
        });
    }
    order.orderStatus = req.body.status;
    if(req.body.status === "Delievered"){
        order.deliveredAt = Date.now();
    }
    await order.save({validateBeforeSave: false});
    res.status(200).json({
        success: true,
    });
});

async function updateStock(id,quantity){
    const product = await Product.findById(id);
    product.stock = product.stock - quantity;
    await product.save({validateBeforeSave: false});
}

exports.deleteOrder = asyncErrorHandler(async (req,res,next)=>{
    const order = await Order.findById(req.params.id);
    if(!order){
        return next(new ErrorHandler("Order not found",404));
    }
    await order.remove();
    res.status(200).json({
        success: true,
    });
});
