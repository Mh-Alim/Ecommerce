const ErrorHandler = require("../utils/errorHandler");
const catchAsyncError = require("./catchAsyncError");
const jwt = require("jsonwebtoken")
const User = require("../models/userModel")


// Yha kuch aisa kr rhe hi ki if user authenticated(login hai) hai tabhi vo getAllProduct access kr paayega
exports.isAuthenticatedUser = catchAsyncError(async(req,res,next) => {
    const {token} = req.cookies;

    if(!token){
        return next( new ErrorHandler("Please Login to access this resource",400))
    }

    const decodeData = jwt.verify(token,process.env.JWT_SECRET);

    req.user = await User.findById(decodeData.id)


    next();
})


// (...val) The spread syntax is commonly used to make shallow copies of JS objects
// ... -> spread operator
/*
example
The array2 has the elements of array1 copied into it. Any changes made to array1 will not be reflected in array2 and vice versa.


let array1 = ['h', 'e', 'l', 'l', 'o'];
let array2 = [...array1];
console.log(array2);
['h', 'e', 'l', 'l', 'o'] // output
*/


exports.authorizeRoles = (...role) => {


    return (req,res,next)=>{

        // if req.user.role == user then if statement call hoga)
        if(!role.includes(req.user.role)){
            return next(new ErrorHandler(`Role : ${req.user.role} is not allowed to access this resource`,403));
        }
    
        // if req.user.role == admin then next call hoga
        next();
    }

}