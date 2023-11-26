const express = require('express');
const userController = require('../controllers/user');
const auth = require('../auth');

const { verify, verifyAdmin, verifyUser } = auth;


const router = express.Router();

// CREATE Routes Section
router.post('/register', userController.registerUser);
router.post('/login', userController.loginUser);
router.post('/details', verify, verifyUser, userController.getDetails);
router.post('/addToCart/:productId', verify, verifyUser, userController.addToCart);
router.post('/checkout', verify, verifyUser, userController.checkoutOrder);

// READ Routes Section
router.get('/userDetails', verify, userController.getProfile);
router.get('/myOrders', verify, verifyUser, userController.getUserOrders);
router.get('/orders', verify, verifyAdmin, userController.getAllOrders);
router.get('/cartItems', verify, verifyUser, userController.getCartItems);

// UPDATE Routes Section
router.put('/:userId/setAsAdmin', verify, verifyAdmin, userController.updateUserAsAdmin);
router.put('/resetPassword', verify, userController.resetPassword);
router.put('/incrementQuantities', verify, verifyUser, userController.incrementProductQuantities);
router.put('/decrementQuantities', verify, verifyUser, userController.decrementProductQuantities);

// DELETE Routes Section
router.delete('/removeToCart/:cartId', verify, verifyUser, userController.removeToCart);


module.exports = router;