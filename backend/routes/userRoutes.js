import express from 'express';
import bcrypt from 'bcryptjs';
import expressAsyncHandler from 'express-async-handler';
import User from '../models/userModel.js';
import { isAuth, generateToken } from '../middleware/token.js';
import transporter from '../helpers/mail.js';

const userRouter = express.Router();

userRouter.post(
  '/getOtp',
  expressAsyncHandler(async (req, res) => {
    const { email } = req.body;
    console.log('email: ', email);

    const user = await User.findOne({ email: email });

    if (user) {
      return res.send({ Message: 'User already Exist.' });
    }

    let otp = Math.floor(100000 + Math.random() * 900000);
    const ttl = 5 * 60 * 1000;
    const expires = Date.now() + ttl;
    console.log('otp: ', otp);

    async function main() {
      const info = await transporter.sendMail({
        from: '"Shop-Now" <developerhb15@gmail.com>',
        to: email,
        subject: 'Shop Now - OTP Verification',
        html: `<h4>This OTP is for your personal use only. Kindly refrain from sharing it with others</h4> 
           <p>Here is Your Otp <span>${otp}</span></p>`,
      });
      console.log(info.messageId);
    }
    main().catch((err) => console.log(err));

    res.status(201).send({ otp: otp, expire_in: expires });
  })
);

userRouter.post(
  '/signin',
  expressAsyncHandler(async (req, res) => {
    const user = await User.findOne({ email: req.body.email });
    if (user) {
      if (bcrypt.compareSync(req.body.password, user.password)) {
        res.send({
          _id: user._id,
          name: user.name,
          email: user.email,
          isAdmin: user.isAdmin,
          token: generateToken(user),
        });
        return;
      }
    }
    res.status(401).send({ message: 'Invalid email or password' });
  })
);

userRouter.post(
  '/signup',
  expressAsyncHandler(async (req, res) => {
    const newUser = new User({
      name: req.body.name,
      email: req.body.email,
      password: bcrypt.hashSync(req.body.password),
    });
    const user = await newUser.save();
    res.send({
      _id: user._id,
      name: user.name,
      email: user.email,
      isAdmin: user.isAdmin,
      token: generateToken(user),
    });
  })
);

userRouter.put(
  '/profile',
  isAuth,
  expressAsyncHandler(async (req, res) => {
    const user = await User.findById(req.user._id);
    if (user) {
      user.name = req.body.name || user.name;
      user.email = req.body.email || user.email;
      if (req.body.password) {
        user.password = bcrypt.hashSync(req.body.password, 8);
      }

      const updateUser = await user.save();
      res.send({
        _id: updateUser._id,
        name: updateUser.name,
        email: updateUser.email,
        isAdmin: updateUser.isAdmin,
        token: generateToken(updateUser),
      });
    } else {
      res.status(404).send({ message: 'User not found' });
    }
  })
);

export default userRouter;
