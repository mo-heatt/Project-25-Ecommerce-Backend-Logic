const mongoose = require('mongoose');
const paymentSchema = new mongoose.Schema({
    resultInfo: {
        resultStatus: {
            type: String,
            required: true,
        },
        resultCode: {
            type: String,
            required: true,
        },
        resultMssg: {
            type: String,
            required: true,
        },
    },
    txnId: {
        type: String,
        required: true,
    },
    BankTxnId: {
        type: String,
        required: true,
    },
    OrderId: {
        type: String,
        required: true,
    },
    txnAmount: {
        type: String,
        required: true,
    },
    txnType: {
        type: String,
        required: true,
    },
    bankName: {
        type: String,
        required: true,
    },
    paymentMode: {
        type: String,
        required: true,
    },
    refundAmt: {
        type: String,
        required: true,
    },
    txnDate: {
        type: Date,
        required: true,
    },
    createdAt: {
        type: Date,
        default: Date.now(),
    },
});

module.exports = mongoose.model("Payment",paymentSchema);