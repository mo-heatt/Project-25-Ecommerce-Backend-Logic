/* Extending the default class Error to ErrorHandler */
class ErrorHandler extends Error{
    constructor(message,statusCode){
        super(message);
        this.statusCode = statusCode;
        /*The Error.captureStackTrace() method is used to capture the stack trace of the error.*/
        Error.captureStackTrace(this, this.constructor);
        /*the second Parameter is optional. It will just create a object of the found Traces if the error occurs*/
    }
}
module.exports = ErrorHandler;

/*The super(message) call in the ErrorHandler constructor calls the Error constructor with the message argument passed to the ErrorHandler constructor. This sets the message property of the ErrorHandler object to the message argument passed to the constructor.*/