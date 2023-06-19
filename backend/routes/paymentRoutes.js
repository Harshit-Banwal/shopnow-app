import express from 'express';
import expressAsyncHandler from 'express-async-handler';
import { isAuth } from '../middleware/token.js';
import dotenv from 'dotenv';
import Razorpay from 'razorpay';
import shortid from 'shortid';
import crypto from 'crypto';
import Order from '../models/orderModel.js';
import { URLSearchParams } from 'url';
import axios from 'axios';
import transporter from '../helpers/mail.js';

dotenv.config();

const paymentRouter = express.Router();

const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID,
  key_secret: process.env.RAZORPAY_KEY_SECRET,
});

const generateAccessToken = async () => {
  try {
    const encodedParams = new URLSearchParams();
    encodedParams.set('grant_type', 'client_credentials');
    encodedParams.set('client_id', `${process.env.INSTAMOJO_CLIENT_ID}`);
    encodedParams.set(
      'client_secret',
      `${process.env.INSTAMOJO_CLIENT_SECRET}`
    );

    const options = {
      method: 'POST',
      url: 'https://test.instamojo.com/oauth2/token/',
      headers: {
        accept: 'application/json',
        'content-type': 'application/x-www-form-urlencoded',
      },
      data: encodedParams,
    };
    const instamojoAuth = await axios(options);
    return instamojoAuth.data;
  } catch (error) {
    console.log(error);
    return {};
  }
};

paymentRouter.get(
  '/razorid',
  isAuth,
  expressAsyncHandler(async (req, res) => {
    res.status(201).send({ keyId: process.env.RAZORPAY_KEY_ID });
  })
);

paymentRouter.post(
  '/razororder',
  isAuth,
  expressAsyncHandler(async (req, res) => {
    const { amount, currency } = req.body;
    // console.log(req.body, 'body data');
    const newAmount = amount.toFixed() * 100;
    const options = {
      amount: newAmount,
      currency: currency,
      receipt: 'Shop_now' + shortid.generate(),
    };
    const response = await razorpay.orders.create(options);

    res.status(201).send({ razorOrder: response });
  })
);

paymentRouter.post(
  '/:id/razor_success',
  expressAsyncHandler(async (req, res) => {
    const payload = req.body;
    let payment_id = payload.razorpay_payment_id;
    let order_id = payload.razorpay_order_id;
    let signature = payload.razorpay_signature;

    //Checking the valid payment via Razorpay
    let key = order_id + '|' + payment_id;
    let expectedSignature = crypto
      .createHmac('sha256', `${process.env.RAZORPAY_KEY_SECRET}`)
      .update(key.toString())
      .digest('hex');

    if (expectedSignature === signature) {
      //Order exist or not
      let order = await Order.findById(req.params.id);

      if (order) {
        //order date
        const date = new Date();
        const day = date.getDate();
        const month = date.getMonth() + 1;
        const year = date.getFullYear();
        const Order_date = day + '/' + month + '/' + year;

        //order time
        const currentOffset = date.getTimezoneOffset();
        const ISTOffset = 330; // IST offset UTC +5:30
        const ISTTime = new Date(
          date.getTime() + (ISTOffset + currentOffset) * 60000
        );
        const hoursIST = ISTTime.getHours();
        const minutesIST = ISTTime.getMinutes();
        const secondsIST = ISTTime.getSeconds();
        const time = hoursIST + ':' + minutesIST + ':' + secondsIST;

        order.isPaid = true;
        order.paidAt = Order_date;
        order.paymentResult = {
          id: payment_id,
          status: payload.status,
          update_time: time,
          email_address: payload.email,
        };
        const updateOrder = await order.save();

        const mailOptions = {
          from: '"Shop-Now" <developerhb15@gmail.com>',
          to: payload.email,
          subject: 'Shop Now - Order Placement',
          html: `<p>Your Order is <h3>SuccessFully Placed</h3></p> 
          <p>Thank you for choosing us! Your support is greatly appreciated. We hope you enjoy your purchase and we look forward to serving you again.</p>`,
        };

        await transporter.sendMail(mailOptions, (error, info) => {
          if (error) {
            console.error(error);
          } else {
            console.log('Email sent: ' + info.response);
          }
        });

        res.status(201).send({
          message: 'Order paid',
          order: updateOrder,
        });
      } else {
        res.status(404).send({ message: 'Order not found' });
      }
    } else {
      res.status(404).send({ message: 'Validation failed' });
    }
  })
);

paymentRouter.post(
  '/instamojo',
  isAuth,
  expressAsyncHandler(async (req, res) => {
    const payload = req.body.options;
    const amount = payload.amount;
    const purpose = payload.purpose;
    const name = payload.buyer_name;
    const email = payload.email;
    const currentUrl = payload.url;

    console.log(payload, 'payloadData');

    const { access_token } = await generateAccessToken();

    const encodedParams = new URLSearchParams();
    encodedParams.set('allow_repeated_payments', 'false');
    encodedParams.set('send_email', 'false');
    encodedParams.set('amount', amount);
    encodedParams.set('purpose', purpose);
    encodedParams.set('buyer_name', name);
    encodedParams.set('email', email);
    encodedParams.set('redirect_url', currentUrl);

    const options = {
      method: 'POST',
      url: 'https://test.instamojo.com/v2/payment_requests/',
      headers: {
        accept: 'application/json',
        Authorization: `Bearer ${access_token}`,
        'content-type': 'application/x-www-form-urlencoded',
      },
      data: encodedParams,
    };
    const createPayment = await axios(options);

    console.log(createPayment.data, 'instamojo payment data');

    if (createPayment.data) {
      res.status(201).send(createPayment.data);
    } else {
      res.status(404).send({ message: 'Error while payment' });
    }
  })
);

paymentRouter.post(
  '/:id/instamojo_success',
  expressAsyncHandler(async (req, res) => {
    const payload = req.body;
    let payment_id = payload.payment_id;
    let payment_status = payload.payment_status;

    console.log(payload, 'on_success');

    //Order exist or not
    let order = await Order.findById(req.params.id);

    if (order) {
      //order date
      const date = new Date();
      const day = date.getDate();
      const month = date.getMonth() + 1;
      const year = date.getFullYear();
      const Order_date = day + '/' + month + '/' + year;

      //order time
      const currentOffset = date.getTimezoneOffset();
      const ISTOffset = 330; // IST offset UTC +5:30
      const ISTTime = new Date(
        date.getTime() + (ISTOffset + currentOffset) * 60000
      );
      const hoursIST = ISTTime.getHours();
      const minutesIST = ISTTime.getMinutes();
      const secondsIST = ISTTime.getSeconds();
      const time = hoursIST + ':' + minutesIST + ':' + secondsIST;

      order.isPaid = true;
      order.paidAt = Order_date;
      order.paymentResult = {
        id: payment_id,
        status: payment_status,
        update_time: time,
        email_address: payload.email,
      };
      const updateOrder = await order.save();

      const mailOptions = {
        from: '"Shop-Now" <developerhb15@gmail.com>',
        to: payload.email,
        subject: 'Shop Now - Order Placement',
        html: `<p>Your Order is <h3>SuccessFully Placed</h3></p> 
        <p>Thank you for choosing us! Your support is greatly appreciated. We hope you enjoy your purchase and we look forward to serving you again.</p>`,
      };

      await transporter.sendMail(mailOptions, (error, info) => {
        if (error) {
          console.error(error);
        } else {
          console.log('Email sent: ' + info.response);
        }
      });

      res.status(201).send({
        message: 'Order paid',
        order: updateOrder,
      });
    } else {
      res.status(404).send({ message: 'Order not found' });
    }
  })
);

export default paymentRouter;
