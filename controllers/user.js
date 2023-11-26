const User = require('../models/User');
const Product = require('../models/Product');
const bcrypt = require('bcrypt');
const auth = require('../auth');


module.exports.registerUser = async (req, res) => {
    try {
        const newUser = new User({
            firstName: req.body.firstName,
            lastName: req.body.lastName,
            mobileNo: req.body.mobileNo,
            email: req.body.email,
            password: bcrypt.hashSync(req.body.password, 10),
            shippingAddress: req.body.shippingAddress,
            isAdmin: req.body.isAdmin,
            isUser: req.body.isUser
        });
  
        const existingUser = await User.findOne({ email: newUser.email });
  
        if(existingUser) {
            return res.status(400).json({ message: 'User with this email already exists.' });
        }
  
        const user = await newUser.save();
        res.status(201).json(user);

    } catch(error) {
        console.error(error.message);
        res.status(500).json({ message: 'An error occurred while registering the user.' });
    }
};


module.exports.loginUser = async (req, res) => {
    try {
        const result = await User.findOne({ email: req.body.email });
  
        if(result === null) {
            return res.status(400).json({ message: 'User with this email does not exist.' });
        }
  
        const isPasswordCorrect = bcrypt.compareSync(req.body.password, result.password);
    
        if(isPasswordCorrect) {
            const accessToken = auth.createAccessToken(result);
            return res.send({ access: accessToken });
        } else {
            return res.status(400).json({ message: 'Password is incorrect.' });
        }

    } catch(error) {
      console.error(error);
      return res.status(500).json({ message: 'An error occurred while requesting to login.' });
    }
};


module.exports.getDetails = async (req, res) => {
    try {
        const result = await User.findById(req.body.id);
  
        if (result) {
            result.password = '';
            return res.send(result);
        } else {
            return res.status(400).json({ message: 'User with this ID does not exist.' });
        }

    } catch(error) {
        console.error(error);
        return res.status(500).json({ message: 'An error occurred while getting details.' });
    }
};


module.exports.getProfile = async (req, res) => {
    try {
        const result = await User.findById(req.user.id);

        if(result) {
            result.password = "";
            return res.send(result);
        } else {
            return res.status(400).json({ message: 'User with this ID does not exist.' });
        }

    } catch(error) {
        console.error(error);
        return res.status(500).json({ message: 'An error occurred while getting profile.' });
    }
};


module.exports.updateUserAsAdmin = async (req, res) => {
    try {
      const adminUserId = req.user.id;
      const userIdToUpdate = req.params.userId;
  
      const adminUser = await User.findById(adminUserId);
      if (!adminUser || !adminUser.isAdmin) {
        return res.status(403).json({ message: 'Permission denied!' });
      }
  
      const userToUpdate = await User.findByIdAndUpdate(
        userIdToUpdate,
        { isAdmin: true },
        { new: true }
      );
  
      if (!userToUpdate) {
        return res.status(404).json({ message: 'User not found.' });
      }
  
      res.status(201).json({ message: 'User updated as admin successfully!'});

    } catch(error) {
      console.error(error.message);
      res.status(500).json({ message: 'An error occurred while updating the user as an admin.' });
    }
};


module.exports.addToCart = async (req, res) => {
    try {
        if (req.user.isAdmin) {
            return res.send("Action Forbidden!");
        }

        const user = await User.findById(req.user.id);
        const product = await Product.findById(req.params.productId);

        if (!product) {
            return res.status(403).json({ message: 'No product found.' });
        }

        let totalAmount = 0;
        
        totalAmount += product.price;

        user.cartArray.push({
            prodInfo: [
                {
                    productId: product._id,
                    nameProduct: product.nameProduct,
                    price: product.price,
                    totalPrice: totalAmount,
                    image: product.image,
                    cartQuantity: 1,
                }
            ],
            addedOn: new Date()
        })

        let isUserUpdated = await user.save();

        if(isUserUpdated) {
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
      if (req.user.isAdmin) {
        return res.send('Action Forbidden!');
      }
  
      const user = await User.findById(req.user.id);
      const cartIdToDelete = req.params.cartId;
  
      // Find the index of the cart item with the specified cartId
      const indexToRemove = user.cartArray.findIndex((cartItem) => cartItem._id.toString() === cartIdToDelete);
  
      if (indexToRemove === -1) {
        return res.status(404).json({ message: 'Cart item not found.' });
      }
  
      // Remove the cart item at the found index
      user.cartArray.splice(indexToRemove, 1);
  
      // Save the updated user
      let isUserUpdated = await user.save();
  
      if (isUserUpdated) {
        return res.status(201).json({ message: 'You have successfully removed the item from your cart!' });
      } else {
        return res.status(401).json({ message: 'Removing item from cart failed.' });
      }
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: 'An error occurred while removing the product from the cart.' });
    }
  };


module.exports.checkoutOrder = async (req, res) => {
    try {
        if (req.user.isAdmin) {
            return res.send("Action Forbidden!");
        }

        const user = await User.findById(req.user.id);

        if (!user.cartArray || user.cartArray.length === 0) {
            return res.status(400).json({ message: 'No items found in your cart!' });
        }

        const productsToUpdate = [];
        for (const cartItem of user.cartArray) {
            for (const productInfo of cartItem.prodInfo) {
                const product = await Product.findById(productInfo.productId);
                if (product) {
                    // Subtract cart quantity from prodStock
                    product.prodStock -= productInfo.cartQuantity;

                    if(product.prodStock == 0) {
                        product.isActive = false
                    }

                    productsToUpdate.push(product.save());
                }
            }
        }

        // Wait for all product updates to complete
        await Promise.all(productsToUpdate);

        const stringNameProduct = user.cartArray.map(cartItem => cartItem.prodInfo.map(product => product.nameProduct)).flat();
        const stringcartId = user.cartArray.map(cartItem => cartItem._id).flat();
        // const stringtotalPrice = user.cartArray.map(cartItem => cartItem.prodInfo.map(product => product.totalPrice)).flat();
        const stringtotalPrice = user.cartArray.reduce((sum, cartItem) =>
        sum + cartItem.prodInfo.reduce((itemSum, prodItem) => itemSum + prodItem.totalPrice, 0)
        , 0);
        const stringcartQuantity = user.cartArray.map(cartItem => cartItem.prodInfo.map(product => product.cartQuantity)).flat();

        const order = {
            cartId: stringcartId,
            nameProduct: stringNameProduct,
            totalPrice: stringtotalPrice,
            shippingAddress: user.shippingAddress,
            cartQuantity: stringcartQuantity,
            paymentInfo: {
                paymentMethod: req.body.paymentMethod,
                cardNumber: req.body.cardNumber,
                cardholderName: req.body.cardholderName,
                expMonth: req.body.expMonth,
                expYear: req.body.expYear,
                cvv: req.body.cvv
            },
            paymentStatus: req.body.paymentStatus,
            orderStatus: req.body.orderStatus
        };

        console.log(order);

        user.orderArray.push(order);
        user.cartArray = [];
        
        let isUserUpdated = await user.save();

        if(isUserUpdated) {
            return res.status(201).json({ message: 'You have successfully made an order!' });
        } else {
            return res.status(401).json({ message: 'Making an order failed.' });
        }

    } catch(error) {
        console.error(error);
        res.status(500).json({ message: 'An error occurred while placing the order.' });
    }
};


module.exports.getUserOrders = async (req, res) => {
    try {
        const result = await User.findById(req.user.id);
        return res.send(result.orderArray);
    } catch(error) {
        console.error(error);
        res.status(500).json({ message: `An error occurred while getting user's the order.` });
    }
};


module.exports.getAllOrders = async (req, res) => {
    try {
        const allOrders = await User.find({}, 'orderArray');
        return res.json(allOrders);
    } catch (error) {
        console.error(error.message);
        return res.status(500).json({ message: 'An error occurred while fetching all orders.' });
    }
};

module.exports.getCartItems = async (req, res) => {
    try {
        const userId = req.user.id;
        const allCart = await User.findById(userId, 'cartArray');
        return res.json(allCart);
    } catch (error) {
        console.error(error.message);
        return res.status(500).json({ message: 'An error occurred while fetching all orders.' });
    }
};


module.exports.incrementProductQuantities = async (req, res) => {
    try {
        if (req.user.isAdmin) {
            return res.status(403).json({ message: 'Action Forbidden!' });
        }

        const user = await User.findById(req.user.id);
        const productId = req.body.productId;

        // Find the index of the product in cartArray
        const productIndex = user.cartArray.findIndex(cartItem =>
            cartItem.prodInfo.some(product => product.productId === productId)
        );

        // Check if the product is not found in the cartArray
        if (productIndex === -1) {
            return res.status(404).json({ message: 'Product not found in the user\'s cart.' });
        }

        // Find the index of the product inside prodInfo array
        const prodInfoIndex = user.cartArray[productIndex].prodInfo.findIndex(product =>
            product.productId === productId
        );

        // Check if the product is not found in the prodInfo array
        if (prodInfoIndex === -1) {
            return res.status(404).json({ message: 'Product not found in the user\'s cart.' });
        }

        // Increment cartQuantity for the specific product by 1
        user.cartArray[productIndex].prodInfo[prodInfoIndex].cartQuantity += 1;

        
        // Increment total price for the specific product by the product price
        user.cartArray[productIndex].prodInfo[prodInfoIndex].totalPrice += user.cartArray[productIndex].prodInfo[prodInfoIndex].price;

        // Save the updated user
        const updatedUser = await user.save();

        if (!updatedUser) {
            return res.status(404).json({ message: 'User or product not found.' });
        }

        return res.json({ message: 'Cart quantity updated successfully.' });
    } catch (error) {
        console.error(error.message);
        return res.status(500).json({ message: 'An error occurred while updating your product quantity.' });
    }
};

module.exports.decrementProductQuantities = async (req, res) => {
    try {
        if (req.user.isAdmin) {
            return res.status(403).json({ message: 'Action Forbidden!' });
        }

        const user = await User.findById(req.user.id);
        const productId = req.body.productId;

        // Find the index of the product in cartArray
        const productIndex = user.cartArray.findIndex(cartItem =>
            cartItem.prodInfo.some(product => product.productId === productId)
        );

        // Check if the product is not found in the cartArray
        if (productIndex === -1) {
            return res.status(404).json({ message: 'Product not found in the user\'s cart.' });
        }

        // Find the index of the product inside prodInfo array
        const prodInfoIndex = user.cartArray[productIndex].prodInfo.findIndex(product =>
            product.productId === productId
        );

        // Check if the product is not found in the prodInfo array
        if (prodInfoIndex === -1) {
            return res.status(404).json({ message: 'Product not found in the user\'s cart.' });
        }

        // Decrement cartQuantity for the specific product by 1
        user.cartArray[productIndex].prodInfo[prodInfoIndex].cartQuantity -= 1;

        // Decrement total price for the specific product by the product price
        user.cartArray[productIndex].prodInfo[prodInfoIndex].totalPrice -= user.cartArray[productIndex].prodInfo[prodInfoIndex].price;

        // Save the updated user
        const updatedUser = await user.save();

        if (!updatedUser) {
            return res.status(404).json({ message: 'User or product not found.' });
        }

        return res.json({ message: 'Cart quantity updated successfully.' });
    } catch (error) {
        console.error(error.message);
        return res.status(500).json({ message: 'An error occurred while updating your product quantity.' });
    }
};






module.exports.resetPassword = async(req, res) => {
    try {
		  const { newPassword } = req.body;
		  const { id } = req.user; 
	  
		  const hashedPassword = await bcrypt.hash(newPassword, 10);
	  
		  await User.findByIdAndUpdate(id, { password: hashedPassword });
	  
		  res.status(200).send({ message: 'Password reset successfully' });
		} catch (error) {
		  console.error(error);
		  res.status(500).send({ message: 'Internal server error' });
		}
};