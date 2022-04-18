const express = require('express');
const { getAllProducts,createProduct, updateProduct, deleteProduct, getSingleProduct, createProductReview, getProductsReviews, deleteReview } = require('../controllers/productController');

// isAuthenticatedUser pta chal rha h ki login h ya nhi
const { isAuthenticatedUser, authorizeRoles } = require('../middleware/auth');

const router = express.Router();
router.route('/products').get(getAllProducts);
router.route('/admin/product/new').post(isAuthenticatedUser,authorizeRoles("admin"),createProduct);

// because both url of deleteProduct and updatProduct are same that why we both the at the same time....
router.route('/admin/product/:id').put(isAuthenticatedUser,authorizeRoles("admin"),updateProduct).delete(isAuthenticatedUser,authorizeRoles("admin"),deleteProduct)
router.route('/product/:id').get(getSingleProduct);


// for all reviews

router.route('/review').put(isAuthenticatedUser, createProductReview)

router.route("/reviews").get(getProductsReviews).delete(isAuthenticatedUser,deleteReview)

module.exports = router;