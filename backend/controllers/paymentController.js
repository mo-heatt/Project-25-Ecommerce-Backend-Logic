const asyncErrorHandler = require('../middlewares/asyncErrorHandler');
//const stripe = require('stripe')
//const STRIPE_SECRET_KEY = process.env.STRIPE_SECRET_KEY;
const paytm = require('paytmchecksum');
const https = require('../models/paymentModel');
const ErrorHandler = require('../utils/errorHandler');
const { v4: uuidv4 } = require('uuid');
const { stripVTControlCharacters } = require('util');

// exports.processPayment = asyncErrorHandler(async (req,res,next)=>{
//     const myPayment = await stripe.paymentIntents.create({
//         amount: req.body.amount,
//         currency: "inr",
//         metadata: {
//             company: "MyCompany",
//         },
//     });
//     res.status(200).json({
//         success: true,
//         client_secret: myPayment.client_secret,
//     });
// });
//  exports.sendStripeApiKey = asyncErrorHandler (async (req,res,next)=>{
//     res.status(200).json({
//         stripeApiKey : STRIPE_API_KEY
//     });
//  })

exports.processPayment = asyncErrorHandler(async (req,res,next)=>{
    const {amount, email, phoneNo} = req.body;
    var params = {};

params["MID"] = process.env.PAYTM_MID;
params["WEBSITE"] = process.env.PAYTM_WEBSITE;
params["CHANNEL_ID"] = process.env.PAYTM_CHANNEL_ID;
params["INDUSTRY_TYPE_ID"] = process.env.PAYTM_INDUSTRY_TYPE;
params["ORDER_ID"] = "oid" + uuidv4();
params["CUST_ID"] = process.env.PAYTM_CUST_ID ;
params["TXN_AMOUT"] = JSON.stringify(amount);
//params["CALLBACK_URL"] = `${req.protoco}://${req.get("host")}/api/v1/callback`;
params["CALLBACK_URL"] = `https://${req.get("host")}/api/v1/callback`;
params["EMAIL"] = email;
params["MOBILE_NO"] = phoneNo;

let paytmCheckSum = paytm.generateSignature(params,process.env.PAYTM_MERCHANT_KEY);
paytmCheckSum.then(function (checksum){
    let paytmParams = {
        ...params,
        "CHECKSUMHASH": checksum,
    };
    res.status(200).json({
        paytmParams,
    });
}).catch(function (error){
    console.log(error);
});
});
