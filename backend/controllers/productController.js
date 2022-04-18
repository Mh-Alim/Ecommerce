const Product = require('../models/productModels');
const express = require('express');
const ErrorHandler = require('../utils/errorHandler');
const catchAsyncErrors = require('../middleware/catchAsyncError');
const ApiFeatures = require('../utils/apiFeatures');
// const app = express();
// app.use(express.json());



//create product-- Admin 

exports.createProduct =  catchAsyncErrors(async(req,res,next)=>{
            req.body.user = req.user.id;
            const prdt = await Product.create(req.body);
            // console.log(req.body);
            res.status(201).json({
                "success":true,
                prdt
            })
    

      
    
})

// get all products
exports.getAllProducts = catchAsyncErrors( async (req,res)=>{

    // in a page how many product i will show
    const resultPerPage = 5;

    const productCount = await Product.countDocuments();


    const apiFeatures = new ApiFeatures(Product.find(),req.query)
    apiFeatures.search()
    .filter()
    .pagination(resultPerPage);

    const products = await apiFeatures.query;

    res.status(200).json({
        success:true,
        products,
        productCount
    })
})

// update products-- admin

exports.updateProduct = catchAsyncErrors( async (req,res,next)=>{

        let product =  await Product.findById(req.params.id);
        if(!product) {
            return next(new ErrorHandler("Product not found",404));
        }

        
        product = await Product.findByIdAndUpdate(req.params.id,req.body,{
            new:true,
            runValidators:true,
            useFindAndModify:false
        })
    
        res.status(200).json({
            success:true,
            product
        })
    
})

// delete product -- Admin

exports.deleteProduct = catchAsyncErrors( async(req,res,next)=>{
        let delProduct = await Product.findById(req.params.id);
        if(!product) {
            return next(new ErrorHandler("Product not found",404));
        }

        await delProduct.remove();
        res.status(200).json({
            success:true,
            message: "product deleted"
        })
    
})

exports.getSingleProduct = catchAsyncErrors( async(req,res,next)=>{


        const product = await Product.findById(req.params.id);
        if(!product) {
            return next(new ErrorHandler("Product not found",404));
        }
    
        res.status(201).json({
            success:true,
            product
        })
  
})



 // creating new review or update the review

 exports.createProductReview = catchAsyncErrors( async(req,res,next)=>{
     const {rating,comment,productId} = req.body;

     const review = {
         user: req.user._id,
         name: req.user.name,
         rating: Number(rating),
         comment,
     }
     console.log(productId)
 
     const product = await Product.findById(productId);

     // this is mine code i have updated it

     let isReviewed ;
     if(product.reviews == null) isReviewed = false;
     else{

         isReviewed = product.reviews.find(
             (rev) => rev.user.toString() === req.user._id.toString()
         )
            console.log("after reviews");
     }
     if(isReviewed){

        product.reviews.forEach((rev)=>{
            if(rev.user.toString() === req.user._id.toString()){
                (rev.rating = rating),
                (rev.comment = comment)
            }
        })

     }
     else{
         product.reviews.push(review);
         product.numOfReviews = product.reviews.length;
     }
     let avg = 0;
     product.reviews.forEach(rev => {
         avg += rev.rating;
     });

     product.ratings = avg/product.reviews.length;

     await product.save({validateBeforeSave : false})


     res.status(200).json({
         success: true,
     })
 })


 /// Get All reviews of a product

 exports.getProductsReviews = catchAsyncErrors( async (req,res,next)=>{
     console.log("here")
     const product = await Product.findById(req.query.id);
    console.log(product.reviews);
     if(!product){
         next(new ErrorHandler("product not found",400));

     }

     res.status(200).json({
         success: true,
         reviews: product.reviews
     })
 })


 // delete Reviews 

 exports.deleteReview = catchAsyncErrors( async(req,res,next)=>{
     const product = await Product.findById(req.query.productId);

     if(!product){
         return next( new ErrorHandler("Product not found",404));

     }

     const reviews = product.reviews.filter(
         (rev) => rev._id.toString() !== req.query.id.toString()
     )

     let avg = 0;

     reviews.forEach((rev)=>{
         avg += rev.rating;
     })

     const ratings = avg / reviews.length;

     const numOfReviews = reviews.length;

     await Product.findByIdAndUpdate(req.query.productId,{
         reviews,ratings,numOfReviews
     },{
         new : true,
         runValidators: true,
         useFindAndModify: false,
     })

     res.status(200).json({
         success: true,
     })
 })