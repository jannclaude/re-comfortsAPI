const Product = require('../models/Product');


module.exports.createProduct = async (req, res) => {
    try {
        const newProduct = new Product ({
            nameProduct: req.body.nameProduct,
            descriptionProduct: req.body.descriptionProduct,
            price: req.body.price,
            category: req.body.category,
            brand: req.body.brand,
            prodStock: req.body.prodStock,
            image: req.body.image,
            isActive: req.body.isActive
        });
    
        const course = await newProduct.save();
        res.status(201).json(course);

    } catch(error) {
        console.error(error);
        return res.status(500).json({ message: 'An error occurred while processing the request' });
    }
};


module.exports.getActiveProduct = async (req, res) => {
    try {
        const result = await Product.find({ isActive: true });
        return res.status(201).json(result);

    } catch(error) {
        console.error(error);
        return res.status(500).json({ message: 'An error occurred while processing the request' });
    }
};


module.exports.getAllProduct = async (req, res) => {
    try {
        const result = await Product.find({});
        return res.status(201).json(result);

    } catch(error) {
        console.error(error);
        return res.status(500).json({ message: 'An error occurred while processing the request' });
    }
};


module.exports.getOneProduct = async (req, res) => {
    try {
        const result = await Product.findById(req.params.productId);
        return res.status(201).json(result);

    } catch(error) {
        console.error(error);
        return res.status(500).json({ message: 'An error occurred while processing the request' });
    }
};


module.exports.updateProduct = async (req, res) => {
    try {
        let updatedProduct = {
            nameProduct: req.body.nameProduct,
            descriptionProduct: req.body.descriptionProduct,
            price: req.body.price,
            category: req.body.category,
            brand: req.body.brand,
            prodStock: req.body.prodStock,
            image: req.body.image,
            isActive: req.body.isActive
        };

        const product = await Product.findByIdAndUpdate(req.params.productId, updatedProduct);

        if(!product) {
            return res.status(400).json({ message: 'No product found with the provided ID' });
        }
        
        return res.status(201).json({ message: `Product updated successfully.` });

    } catch(error) {
        console.error(error);
        return res.status(500).json({ message: 'An error occurred while processing the request' });
    }
};

module.exports.archiveProduct = async (req, res) => {
    try {
        const result = await Product.findByIdAndUpdate(req.params.productId, { isActive: false }, { new: true });

        if(result) {
            return res.status(201).json({ message: `Product has been archived successfully.` });
        } else {
            return res.status(400).json({ message: 'No product found with the provided ID' });
        }
        
    } catch(error) {
        console.error(error);
        return res.status(500).json({ message: 'An error occurred while processing the request' });
    }
};

module.exports.activateProduct = async (req, res) => {
    try {
        const result = await Product.findByIdAndUpdate(req.params.productId, { isActive: true }, { new: true });

        if(result) {
            return res.status(201).json({ message: `Product has been activated successfully.` });
        } else {
            return res.status(400).json({ message: 'No product found with the provided ID' });
        }
        
    } catch(error) {
        console.error(error);
        return res.status(500).json({ message: 'An error occurred while processing the request' });
    }
};


module.exports.searchProducts = async (req, res) => {
    try {
        const { query } = req.body;

        const products = await Product.find({
            $or: [
                { nameProduct: { $regex: query, $options: 'i' } },
                { brand: { $regex: query, $options: 'i' } },
                { category: { $regex: query, $options: 'i' } }
            ],
            isActive: true
        });
        if(products.length === 0) {
        return res.status(404).json({ message: 'No products found with the provided name.'})
        }

        res.status(200).json(products);
        
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'An error occurred while searching for products.' });
    }
};