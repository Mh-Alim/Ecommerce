const express = require('express');
const app = express();
const cookieParser = require('cookie-parser')
const errorMiddleware = require('./middleware/error')

// app.use(express.json());
// Route imports
app.use(express.json());
app.use(cookieParser());
const productRoutes = require('./routes/productRoutes');
const userRoutes = require('./routes/userRoutes');
const orderRoutes = require('./routes/orderRoutes')

app.use('/api/v1',productRoutes);
app.use('/api/v1',userRoutes);
app.use('/api/v1',orderRoutes);
// middleware for error 

app.use(errorMiddleware);

module.exports = app;