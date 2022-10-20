import express from 'express';
import data from '../data.js';
import Product from '../models/productModel.js';
import User from '../models/userModel.js';

const mainRouter = express.Router();

mainRouter.get('/', async (req, res) => {
  // for product
  await Product.remove({});
  const createProducts = await Product.insertMany(data.products);

  //for users
  await User.remove({});
  const createUsers = await User.insertMany(data.users);
  res.send({ createProducts, createUsers });
});

export default mainRouter;
