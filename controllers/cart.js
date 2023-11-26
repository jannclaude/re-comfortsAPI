const User = require('../models/User');
const Product = require('../models/Product');
const Cart = require('../models/Cart');
const { v4: uuidv4 } = require('uuid');


module.exports.addToCart = async (req, res) => {
    try {
        const product = await Product.findById(req.params.productId);

        if (!product) {
            return res.status(403).json({ message: 'No product found.' });
        }

        let sessionId = req.cookies.sessionId;
        if (!sessionId) {
            sessionId = uuidv4();
            res.cookie('sessionId', sessionId, { maxAge: 900000, httpOnly: true });
        }

        let cart = await Cart.findOne({ sessionId });

        if (!cart) {
            cart = new Cart({
                sessionId,
                prodInfo: [
                    {
                        productId: product._id,
                        nameProduct: product.nameProduct,
                        price: product.price,
                        cartQuantity: 1,
                    },
                ],
                addedOn: new Date()
            });
        }

        const savedCart = await cart.save();

        if(savedCart) {
            return res.status(201).json({ message: 'You have successfully added the item to your cart!' });
        } else {
            return res.status(401).json({ message: 'Adding item to cart failed.' });
        }
    
    } catch (error) {
        console.error(error.message);
        return res.status(500).json({ message: 'An error occurred while adding item to your cart.' });
    }
};


module.exports.removeToCart = async (req, res) => {
    try {
        let sessionId = req.params.sessionId;

        // Check if the sessionId is present
        if (!sessionId) {
            return res.status(403).json({ message: 'SessionId not found.' });
        }

        // Find and delete the cart based on sessionId
        const deletedCart = await Cart.findOneAndDelete({ _id: sessionId });

        // Check if the cart was deleted
        if (deletedCart) {
            return res.status(200).json({ message: 'Cart successfully deleted.' });
        } else {
            return res.status(404).json({ message: 'Cart not found.' });
        }

    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'An error occurred while removing the product from the cart.' });
    }
};


module.exports.updateProductQuantities = async (req, res) => {
    try {
        if (req.user.isAdmin) {
            return res.send("Action Forbidden!");
        }

        const user = await User.findById(req.user.id);
        const productId = req.body.productId;
        const newCartQuantity = req.body.cartQuantity;

        // Find the index of the product in cartArray
        const productIndex = user.cartArray.findIndex(cartItem => cartItem.prodInfo.some(product => product.productId === productId));

        if (productIndex === -1) {
            return res.status(404).json({ message: 'Product not found in the user\'s cart' });
        }

        // Update cartQuantity and cartPrice
        user.cartArray[productIndex].prodInfo.forEach(product => {
            if (product.productId === productId) {
                product.cartQuantity = newCartQuantity;
            }
        });

        user.cartArray[productIndex].cartPrice = user.cartArray[productIndex].prodInfo.reduce((total, product) => {
            return total + (product.price * product.cartQuantity);
        }, 0);

        // Save the updated user
        const updatedUser = await user.save();

        console.log(updatedUser);

        if(!updatedUser) {
            return res.status(404).json({ message: 'User or product not found.' }); 
        }

        return res.json({ message: 'Cart quantity updated successfully.' });
    } catch(error) {
        console.error(error.message);
        return res.status(500).json({ message: 'An error occurred while updating your product quantity.' });
    }
};