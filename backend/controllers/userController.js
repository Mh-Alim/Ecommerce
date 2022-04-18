const ErrorHandler = require('../utils/errorHandler');
const catchAsyncErrors = require('../middleware/catchAsyncError');

const sendToken = require("../utils/jwtToken")

const User = require('../models/userModel')
const sendEmail = require("../utils/sendEmail.js")
const crypto = require('crypto')
// Register a user

exports.registerUser = catchAsyncErrors( async(req,res,next) => {
    const {name,email,password} =  req.body;
    const user = await User.create({
        name,
        email,
        password,
        avatar:{
            public_id:"This is a sample id",
            url:"profilepicUrl",
        }
    });

    sendToken(user,200,res)
});


// Login User 

exports.loginUser = catchAsyncErrors( async (req,res,next) => {

    const {email,password} = req.body;

    // checking if user has given password and email both

    if(!email || !password) {
        return next(new ErrorHandler("please enter password and email",400)); 
    }

    const user = await User.findOne({email}).select("+password")

    if(!user) {
        return next(new ErrorHandler("invalid email or password",400))
    }

    const isPasswordMatched = await user.comparePassword(password)

    if(!isPasswordMatched) {
        return next(new ErrorHandler("invalid email or password",400))
    }

    sendToken(user,200,res);
})


// Logout user

exports.logout = catchAsyncErrors( async(req,res,next) => {

    res.cookie("token",null,{
        expires:new Date(Date.now()),
        httpOnly: true,
    })

    res.status(200).json({
        success:true,
        message: "Logged Out"
    })
})


// Forgot password

exports.forgotPassword = catchAsyncErrors(async (req,res,next) => {
    const user = await User.findOne({email:req.body.email});

    if(!user){
        return next(new ErrorHandler("User not found",404));
    }

    // Get ResetPassword Token 

    const resetToken = user.getResetPasswordToken();
    console.log(resetToken)

    await user.save({ validateBeforeSave : false});

    const resetPasswordUrl = `${req.protocol}://${req.get("host")}/api/v1/password/reset/${resetToken}`

    const message = `Your password reset token is :- \n\n ${resetPasswordUrl} \n\nIf you have not requested this mail then please ignore it`

    try {

        await sendEmail({
            email: user.email,
            subject: `Ecommerce password recovery`,
            message
        })
        
        res.status(200).json({
            success:true,
            message: `email sent to ${user.email} successfully`
        })
    } catch (error) {
        user.resetPasswordToken = undefined;
        user.resetPasswordExpire= undefined;
        await user.save({ validateBeforeSave : false});
        return next(new ErrorHandler(error.message,500))
    }
})


//Reset password
// Jo email pe link mila use click krna par kya hoga uska function yha likha hua hai

exports.resetPassword = catchAsyncErrors(async(req,res,next)=>{

    // creating token hash

    const resetPasswordToken = crypto.createHash("sha256").update(req.params.token).digest("hex")

    const user = await User.findOne({
        resetPasswordToken,
        resetPasswordExpire:{$gt: Date.now()},
    });

    if(!user){
        return next (new ErrorHandler("Reset password Token is invalid or has been expired",400));

    }

    if(req.body.password !== req.body.confirmPassword){
        return next(new ErrorHandler("Password does not password",400));
    }

    user.password = req.body.password;
    user.resetPasswordToken = undefined;
    user.resetPasswordExpire = undefined;

    await user.save();

    sendToken(user,200,res)


})


// Get user Detail

exports.getUserDetails = catchAsyncErrors( async(req,res,next)=>{
    const user = await User.findById(req.user.id);


    res.status(200).json({
        success:true,
        user
    })
})


// update your password

exports.updatePassword = catchAsyncErrors(async(req,res,next) => {

    const user = await User.findById(req.user.id).select("+password");


    const isPasswordMatched = await user.comparePassword(req.body.oldPassword)

    if(!isPasswordMatched){
        return next(new ErrorHandler("old password is incorrect",400));
    }
    
    if(req.body.newPassword !== req.body.confirmPassword){
        return next(new ErrorHandler("password does not match", 400));
    }

    user.password = req.body.newPassword;

    await user.save();

    sendToken(user,200,res);
})

// update User profile

exports.updateProfile = catchAsyncErrors(async(req,res,next) => {

    const newUserData = {
        name: req.body.name,
        email: req.body.email
    }

    const user = await User.findByIdAndUpdate(req.user.id,newUserData,{
        new:true,
        runValidators:true,
        userFindAndModify: false,
    })

    res.status(200).json({
        success:true,
    })
})

// only for admin 

// Get all users (admin)

// if admin wants to see all users details

exports.getAllUsers = catchAsyncErrors(async(req,res,next)=>{
    const users = await User.find();
    res.status(200).json({
        success:true,
        users
    })
})



// Get single users (admin)
// if admin wants to see single user details 

exports.getSingleUser = catchAsyncErrors(async(req,res,next)=>{
    const user = await User.findById(req.params.id)
   

    if(!user){
        return next(new ErrorHandler(`user does not exist with Id : ${req.params.id}`,400))
    }
    res.status(200).json({
        success:true,
        user
    })
})


// updating user role -- Admin

exports.updateUserRole = catchAsyncErrors(async(req,res,next) => {

    const newUserData = {
        name: req.body.name,
        email: req.body.email,
        role: req.body.role,
    }

    const user1 = await User.findById(req.params.id);
    if(!user1){
        return next(new ErrorHandler("User not found",400))
    }

    const user = await User.findByIdAndUpdate(req.params.id,newUserData,{
        new:true,
        runValidators:true,
        userFindAndModify: false,
    })

    res.status(200).json({
        success:true,
    })
})

// Delete User -- Admin
exports.deleteUser = catchAsyncErrors(async(req,res,next) => {

    const user = await User.findById(req.params.id);
    // we will remove the cloudnary later

    if(!user){
        return next (new ErrorHandler(`user doest not exist with Id: ${req.params.id}`,400))

    }

    await user.remove();

    res.status(200).json({
        success: true,
        message: "user deleted successfully"
    });
});