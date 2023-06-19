import express from 'express';
// import data from '../data.js';
import Product from '../models/productModel.js';
import User from '../models/userModel.js';
import bcrypt from 'bcryptjs';

const mainRouter = express.Router();

mainRouter.get('/', async (req, res) => {
  try {
    const { product, user } = req.body;

    // for product
    const newProduct = new Product({
      name: product.name,
      slug: product.slug,
      image: product.image,
      brand: product.brand,
      category: product.category,
      description: product.description,
      price: product.price,
      countInStock: product.countInStock,
      rating: product.rating,
      numReview: product.numReview,
    });

    const createProduct = await newProduct.save();

    // //for users
    if (user) {
      const newUser = new User({
        name: user.name,
        email: user.email,
        password: bcrypt.hashSync(`${user.password}`),
        isAdmin: user.isAdmin,
      });

      const createUser = await newUser.save();
      res.send({ createProduct, createUser });
    } else {
      res.send({ createProduct });
    }
  } catch (error) {
    res.status(500).send({ Message: error });
  }
});

export default mainRouter;
