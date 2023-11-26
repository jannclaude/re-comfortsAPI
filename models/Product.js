const mongoose = require('mongoose');

const productSchema = new mongoose.Schema({
    nameProduct: {
        type: String,
        required: [true, 'Product name is required.']
    },
    descriptionProduct: {
        type: String,
        required: [true, 'Description is required.']
    },
    price: {
        type: Number,
        required: [true, 'Price is required.']
    },
    category: {
        type: String,
        required: [true, 'Category name is required.']
    },
    brand: {
        type: String,
        required: [true, 'Brand name is required.']
    },
    prodStock: {
        type: Number,
        required: [true, 'Stock is required']
    },
    image: {
        type: String,
        required: [true, 'Image URL is required']
    },
    isActive: {
        type: Boolean,
        required: [true, 'isActive is required.']
    }
});

module.exports = mongoose.model('Product', productSchema);