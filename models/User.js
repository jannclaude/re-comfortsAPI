const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
    firstName: {
        type: String,
        required: [true, 'First name is required.']
    },
    lastName: {
        type: String,
        required: [true, 'Last name is required.']
    },
    mobileNo: {
        type: String,
        required: [true, 'Mobile number is required.']
    },
    email: {
        type: String,
        required: [true, 'Email is required.']
    },
    password: {
        type: String,
        required: [true, 'Password is required.']
    },
    shippingAddress: {
        type: String,
        required: [true, 'Shipping address is required.']
    },
    isAdmin: {
        type: Boolean,
        default: false
    },
    isUser: {
        type: Boolean,
        default: false
    },
    cartArray: [
        {
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
                    totalPrice: {
                        type: Number,
                        required: [true, 'Product price is required']
                    },
                    image: {
                        type: String,
                        required: [true, 'Product image URL is required']
                    },
                    cartQuantity: {
                        type: Number,
                        required: [true, 'Cart quantity is required']
                    }
                }
            ],
            addedOn: {
                type: Date,
                default: new Date()
            }
        }       
    ],
    orderArray: [
        {
            cartId: {
                type: Array,
                required: [true, 'Cart ID is required']
            },
            nameProduct: {
                type: Array,
                required: [true, 'Product name is required']
            },
            totalPrice: {
                type: Number,
                required: [true, 'Total price is required']
            },
            shippingAddress: {
                type: String,
                required: [true, 'Shipping address is required']
            },
            cartQuantity: {
                type: Array,
                required: [true, 'Cart quantity is required']
            },
            paymentInfo: [
                {
                    paymentMethod: {
                        type: String,
                        required: [true, 'Payment method is required']
                    },
                    cardNumber: {
                        type: Number,
                        required: [true, 'Card number is required']
                    },
                    cardholderName: {
                        type: String,
                        required: [true, 'Card name is required']
                    },
                    expMonth: {
                        type: Number,
                        required: [true, 'Card expiry month is required']
                    },
                    expYear: {
                        type: Number,
                        required: [true, 'Card expiry year is required']
                    },
                    cvv: {
                        type: Number,
                        required: [true, 'Card CVV is required']
                    }
                }
            ],
            paymentStatus: {
                type: String,
                required: [true, 'Payment status is required']
            },
            orderStatus: {
                type: String,
                required: [true, 'Order status is required']
            }
        }
    ]

});

module.exports = mongoose.model('User', userSchema);