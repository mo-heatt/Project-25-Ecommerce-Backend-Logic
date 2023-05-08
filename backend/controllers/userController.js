const User = require('../models/userModel');
const asyncErrorHandler = require('../middlewares/asyncErrorHandler');
const sendToken = require('../utils/sendToken');
const ErrorHandler = require('../utils/errorHandler');
const sendEmail = require('../utils/sendEmail');
const crypto = require('crypto');
const bcrypt = require('bcrypt');
const cloudinary = require('cloudinary');

exports.registerUser = asyncErrorHandler( async(req,res,next) => {
    const myCloud = await cloudinary.v2.uploader.upload(req.body.avatar, {
        folder: "avatars",
        width: 150,
        crop: "scale",
    });

    const {name, email, gender, password} = req.body;

    const user = User.create({
        name,
        email,
        gender,
        password,
        avatar:{
            public_id: myCloud.public_id,
            url: myCloud.secure_url,
        },
    });
    sendToken(user, 201, res);
});

exports.loginUser = asyncErrorHandler(async (req,res,next)=>{
    const {email, password} = req.body;
    if(!email || !password){
        return next(new ErrorHandler("Please enter email and password",400));
    }
    const user = await User.findOne({email}).select("+password");
    if(!user){
        return next (new ErrorHandler("email not found!"));
    }
    const isPasswordmatched = await bcrypt.comparePassword(user.password,this.password);
    if(!isPasswordmatched){
        return next(new ErrorHandler("Invalid password",401));
    }
    sendToken(user,201,res);
});

exports.logOutUser = asyncErrorHandler(async (req,res,next)=>{
    res.cookie("token",null,{
        expires: new Date(Date.now()),
        httpOnly: true,
    });
    res.status(200).json({
        success: true,
        message: "Logged Out",
    });
});

exports.getUserDetails =  asyncErrorHandler(await (req,res,next)=>{
    const user = await User.findById(req.user.id);
    res.status(200).json({
        success:true,
        user,
    });
});

exports.forgotPassword = asyncErrorHandler(await (req,res, next)=>{
    const user = await User.findOne({email:req.body.email);
    if(!user){
        return next(new ErrorHandler("User not found",404));
    }
    const resetToken = await user.getResetPasswordToken();
    await user.save({validateBeforeSave : false});
    const resetPasswordUrl = `https://${req.get("host")}/password/reset/${resetToken}`;
    try{
        await sendMail({
            email:user.email,
            tempelateId: process.env.SENDGRID_RESET_TEMPLATED,
            data:{
                reset_url: resetPasswordUrl,
            }
        });
        res.status(200).json({
            success: true,
            message: `Email sent to ${user.email} sucessfully`,
        })
    } catch (error){
        user.resetPasswordToken = undefined;
        user.resetPasswordExpire = undefined;

        await user.save({validateBeforeSave: false});
        return next(new ErrorHandler(error.message, 500))
    }
});

exports.resetPassword = asyncErrorHandler(async (req,res, next)=>{
    const resetPasswordToken = crypto.createHash("sha256").update(req.params.token).digest("hex");
    const user = await User.findOne({
        resetPasswordToken,
        resetPasswordExpire : {$gt: Date.now()},
    });
    if(!user){
        return next(new ErrorHandler("Invalid reset password token",400));
    }
    user.password = req.body.password;
    user.resetPassworToken = undefined;
    user.resetPasswordExpire = undefined;

    await user.save();
    sendToken(user,200,res);
});

exports.updatePassword = asyncErrorHandler(async(req,res,next)=>{
    const user = await User.findOne({email}).select("+password");
    const isPasswordmatched = await user.comparePassword(req.body.oldPassword);
    if(!isPasswordmatched){
        return next(new ErrorHandler("old Password is Invalid",400));
    }
    user.password = req.body.newPassword;
    await user.save();
    sendToken(user,201,res);
});

exports.updateProfile = asyncErrorHandler(await (req,res,next)=>{
    const newUserData = {
        name: req.body.name,
        email: req.body.email,
    }

    if(req.body.avatar !== ""){
        const user = await User.findById(req.user.id);
        const ImageId = user.avatar.public_id;
        await cloudinary.v2.uploader.destroy(imageId);
        const myCloud = await cloudinary.v2.uploader(req.body.avatar, {
            folder: "avatar",
            width: 150,
            crop: "scale",
        });
        newUserData.avatar = {
            public_id: myCloud.public_id,
            url: myCloud.secure_url,
        }
    }
    await User.findByIdAndUpdate(req.user.id, newUserData, {
        new: true,
        runValidators: true,
        useFindAndModify: true,
    });
    res.status(200).json({
        success: true,
    });
});

exports.getSingleUser = asyncErrorHandler(await (req,res,next)=>{
    const user = await User.findById(req.params.id);
    if(!user){
        return next(new ErrorHandler(`User does not exist with id: ${req.params.id}`,400));
    }
    res.status(200).json({
        success: true,
        user,
    });
});

exports.updateUserRole = asyncErrorHandler(await(req,res,next)=>{
    const newUserData = {
        name: req.body.name,
        email: req.body.email,
        gender: req.body.gender,
        role: req.body.role,
    }
    await User.findByIdAndUpdate(req.params.id, newUserData, {
        new: true,
        runValidators: true,
        useFindAndModify: false,
    });
    res.status(200).json({
        success: true,
    });
});

exports.deleteUser = asyncErrorHandler(await (req,res,next)=>{
    const user = await User.findById(req.params.id);
    if(!user){
        return next(new ErrorHandler(`User with id : ${req.params.id} does not exist,404`));
    }
    await user.remove();
    res.status(200).json({
        success: true,
    });
});