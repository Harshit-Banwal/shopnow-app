import express from 'express';
import path from 'path';
import dotenv from 'dotenv';
import mongoose from 'mongoose';
import seedRouter from './routes/mainRoutes.js';
import productRouter from './routes/productRoutes.js';
import userRouter from './routes/userRoutes.js';
import orderRouter from './routes/orderRoutes.js';
import paymentRouter from './routes/paymentRoutes.js';
import cors from 'cors';
const app = express();
const port = process.env.PORT || 5000;

// fetching the env file
dotenv.config();

// DB connection
mongoose
  .connect(process.env.MONGO_DB_URL)
  .then(() => {
    console.log('DB connect Successfully');
  })
  .catch((err) => {
    console.log(err);
  });

// middlewares
// app.use(cors({ origin: '*' }));
app.use(cors({ origin: 'https://shop-now-ten.vercel.app' }));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Api's Routers
app.get('/', (req, res) => res.status(201).send('HI'));
app.use('/api/seed', seedRouter);
app.use('/api/products', productRouter);
app.use('/api/users', userRouter);
app.use('/api/products/slug/:slug', productRouter);
app.use('/api/products/:id', productRouter);
app.use('/api/products/:id', productRouter);
app.use('/api/orders', orderRouter);
app.use('/api/payment', paymentRouter);

const __dirname = path.resolve();
app.use(express.static(path.join(__dirname, '/frontend/build')));
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, '/frontend/build/index.html'));
});

// Express error handler
app.use((err, req, res, next) => {
  res.status(500).send({ message: err.message });
});

//Listening server
app.listen(port, () => {
  console.log(`Sever is listening on http://localhost:${port}`);
});
