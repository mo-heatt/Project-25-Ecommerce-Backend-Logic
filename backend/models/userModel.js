const mongoose = require('mongoose');
const validator = require('validator');
const bcrypt = require('bcrypt.js');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');

const userSchema = new mongoose.model({
    name: {
        type: String,
        required: [true, "Please enter your name"],
    },
    email: {
        type: String,
        required: [true, "Please enter your mail"],
        unique: true,
    },
    gender: {
        type: String,
        required: [true, "Please enter your gender"],
    },
    password: {
        type: String,
        required: [true, "Please enter your password"],
        minLength: [8, "Password should be minimum 8 characters"],
        select: false,
    },
    avatar:{
        publicId:{
            type: String,
        },
        url:{
            type: String,
        }
    },
    role:{
        type: String,
        default:"user",
    },
    createdAt: {
        type: Date,
        default: Date.now(),
    },
    resetPasswordToken: String,
    resetPasswordExpire: Date,
})

userSchema.pre("save", async function(next){
    if(!this.isModified("password")){
        next();
    }
    this.password = await bcrypt.hash(this.password,10)
});
userSchema.methods.comparePassword = async function(enteredPassword){
    return await bcrypt.compare(enteredPassword, this.password);
}
userSchema.methods.getResetPasswordToken = async function(){
    const resetToken = crypto.randomBytes(20).toString("hex");
    this.resetPasswordToken = crypto.createHash("sha256").update(resetToken).digest("hex");
    this.resetPasswordExpire = Date.now()+15*60*1000;
    return resetToken;
}
module.exports = mongoose.model("User",userSchema);