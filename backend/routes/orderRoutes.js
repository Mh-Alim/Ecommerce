const express = require('express');
const { newOrder, getSingleOrder, myOrders, getAllOrders, updateOrder, deleteOrder } = require('../controllers/orderController');
const router = express.Router();
const { isAuthenticatedUser, authorizeRoles } = require('../middleware/auth');


// creating order
router.route('/order/new').post(isAuthenticatedUser,newOrder)

// seeing user order details
router.route('/order/:id').get(isAuthenticatedUser,getSingleOrder)


// my orders --
router.route('/orders/me').get(isAuthenticatedUser,myOrders)


router.route('/admin/orders').get(isAuthenticatedUser,authorizeRoles("admin"),getAllOrders)

router.route('/admin/order/:id').put(isAuthenticatedUser,authorizeRoles("admin"),updateOrder).delete(isAuthenticatedUser,authorizeRoles("admin"),deleteOrder)
module.exports = router;