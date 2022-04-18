// Creating token and saving in cookie


const sendToken = (user,statusCode,res) => {
    const token = user.getJWTToken();   // this getJWTToken() will give me token

    // options for cookie 

    const options = {
        expires: new Date(
            Date.now() + process.env.COOKIE_EXPIRE * 24 * 60 * 60 * 1000
        ),
        httpOnly : true,    // document.cookie se apan access nhi kr paayenge cookie ko
    };

    res.status(statusCode).cookie("token",token,options).json({
        success:true,
        user,
        token
    });
}

module.exports = sendToken;