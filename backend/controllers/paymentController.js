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


