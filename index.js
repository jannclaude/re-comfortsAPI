const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const userRoutes = require('./routes/user');
const productRoutes = require('./routes/product');
const cartRoutes = require('./routes/cart');
const cookieParser = require('cookie-parser');
const dotenv = require('dotenv');

dotenv.config();

const port = 4004;
const app = express();

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

mongoose.connect(process.env.CONNECTION_URL, {
    useNewUrlParser: true,
    useUnifiedTopology: true
});

mongoose.connection.once('open', () => console.log('You are now connected to MongoDB Atlas.'));

// Routes Section
app.use('/b4/users', userRoutes);
app.use('/b4/products', productRoutes);
app.use('/b4/cart', cartRoutes);


if(require.main === module) {
    app.listen(process.env.PORT || port, () => {
        console.log(`API is now online on port ${ process.env.PORT || port}`);
    })
}

module.exports = {app, mongoose};