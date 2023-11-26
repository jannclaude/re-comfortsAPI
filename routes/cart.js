const express = require('express');
const cartController = require('../controllers/cart');

const router = express.Router();

// CREATE Routes Section
router.post('/addToCart/:productId', cartController.addToCart);

// UPDATE Routes Section
router.put('/updateQuantities', cartController.updateProductQuantities);

// DELETE Routes Section
router.delete('/removeToCart/:sessionId', cartController.removeToCart);


module.exports = router;