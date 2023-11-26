const mongoose = require('mongoose');

const cartSchema = new mongoose.Schema({
    prodInfo: [
        {
            productId: {
                type: String,
                required: [true, 'Product ID is required']
            },
            nameProduct: {
                type: String,
                required: [true, 'Product name is required']
            },
            price: {
                type: Number,
                required: [true, 'Product price is required']
            },
            image: {
                type: String,
                required: [true, 'Product image URL is required']
            },
            cartQuantity: {
                type: Number,
                required: [true, 'Card quantity is required']
            }
        }
    ],
    addedOn: {
        type: Date,
        default: new Date()
    }
});

module.exports = mongoose.model('Cart', cartSchema);