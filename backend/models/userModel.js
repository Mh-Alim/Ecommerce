const mongoose = require('mongoose')
const validator = require('validator')
const bcrypt = require('bcryptjs')
const jwt = require('jsonwebtoken')
const crypto = require('crypto')


const userSchema = new mongoose.Schema({
    name:{
        type:String,
        required:[true,"Please Enter your name"],
        maxlength:[30,"Name can not exceed 30 characters"],
        minlength:[4,"Name should have more than 4 characters"]
    },

    email:{
        type:String,
        required: [true,"Please Enter your email"],
        unique:true,
        validate:[validator.isEmail,"Please Enter a valid Email"]
    },
    password:{
        type:String,
        required:[true,"Please Enter Your password"],
        minlength: [8,"Password should be greater than 8 characters"],
        select:false,
    },

    avatar:{
        public_id:{
            type:String,
            required:true,
        },
        url:{
            type:String,
            required:true
        }
    },
    role:{
        type:String,
        default:"user"
    },

    resetPasswordToken: String,
    resetPasswordExpire: Date,

});


// database me password save hone ke pahle hi hash me convert ho jaay isliye ye function likh rhe h
userSchema.pre('save',async function(next){

    // Apan jab update krne jaaye to password again khudka hash mt nikaal le hence this condition is necessary
    if(!this.isModified("password")) next();
    this.password = await bcrypt.hash(this.password,10);
})


// basically hum register hone ke baad login rhna h website me to isliye hum jwt token ka user krte hai 
// mainly login purpose ke liye hum jwt token ka use krte ha
 
// JWT TOKEN

userSchema.methods.getJWTToken = function(){
    return jwt.sign(
        {id:this._id},
        process.env.JWT_SECRET,
        {expiresIn: process.env.JWT_EXPIRE}
        )
   
}

userSchema.methods.comparePassword = async function(enteredPassword){
    return await bcrypt.compare(enteredPassword,this.password);
}


// suppose hum password daalke bhool gye kya daala tha password so we required reset password thing below function will do that 

userSchema.methods.getResetPasswordToken = function(){

    // Generating token 

    const resetToken = crypto.randomBytes(20).toString('hex');
    // Hashing and adding resetPassword to userSchema

    this.resetPasswordToken = crypto.createHash('sha256').update(resetToken).digest("hex");
    this.resetPasswordExpire = Date.now()+15*60*1000;
    return resetToken;
}

module.exports =  mongoose.model("User",userSchema);