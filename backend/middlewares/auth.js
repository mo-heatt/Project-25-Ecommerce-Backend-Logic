const jwt = require('jsonwebtoken');
const User = require('../models/userModel');
const asyncHandler = require('./asyncErrorHandler');
const ErrorHandler = require('../utils/errorHandler');

exports.isAuthenticateUser = asyncHandler(async (req,res,next)=>{
    const {token}=req.cookies;
    if(!token){
        return next(new ErrorHandler("Please login to acess",401));
    }
    const decodeData = jwt.verify(token,process.env.JWT_SECRET);
    req.user = await User.findById(decodeData.id);
    next();
});

exports.authorizeRoles = (...roles)=>{
    return(req,res,next)=>{
        if(!roles.includes(req.user.role)){
            return next(new ErrorHandler(`Role: ${req.user.role} is not allowed`,403));
        }
        next();
    }
}