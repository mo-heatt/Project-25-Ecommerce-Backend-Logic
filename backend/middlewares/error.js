const { fail } = require("assert");
const ErrorHandler = require("../utils/errorHandler");

module.exports = (err,req,res,next)=>{
    err.statusCode = err.statusCode ||500;
    err.message = err.message || "Internal Server error";

    //mongodb id error
    if(err.name === "CastError"){
        const message = `Resource Not Found. Invalid: ${err.path}`;
        err = new ErrorHandler(message,400);
    }

    //wrong jwt error
    if(err.code === "JsonWebTokenError"){
        const message = 'Jwt Error';
        err = new ErrorHandler(message,400);
    }

    //jwt expire error
    if(err.code === "JsonWebTokenError"){
        const message = 'Jwt is Expired';
        err = new ErrorHandler(message,400);
    }

    res.status(err.statusCode).json({
        success: fail,
        message: err.message,
    });
}