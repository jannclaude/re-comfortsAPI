const express = require('express');
const productController = require('../controllers/product');
const auth = require('../auth');

const { verify, verifyAdmin } = auth;


const router = express.Router();

// CREATE Routes Section
router.post('/add', verify, verifyAdmin, productController.createProduct);
router.post('/search', productController.searchProducts);

// READ Routes Section
router.get('/active', productController.getActiveProduct);
router.get('/all', productController.getAllProduct);
router.get('/:productId', productController.getOneProduct);

// UPDATE Routes Section
router.put('/:productId', verify, verifyAdmin, productController.updateProduct);
router.put('/:productId/archive', verify, verifyAdmin, productController.archiveProduct);
router.put('/:productId/activate', verify, verifyAdmin, productController.activateProduct);


module.exports = router;