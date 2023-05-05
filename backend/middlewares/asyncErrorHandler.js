module.exports.asyncHandler = (errorFunction) => (req,res,next) =>{
    Promise.resolve(errorFunction(req,res,next)).catch(next);
}
// Within this middleware function, we wrap the call to the asynchronous route handler function errorFunction with a Promise.resolve call. This is done to ensure that if errorFunction returns a value that is not a Promise, we still get a Promise object to work with.