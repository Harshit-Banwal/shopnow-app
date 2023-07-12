import nodemailer from 'nodemailer';
import dotenv from 'dotenv';

dotenv.config();

const transporter = nodemailer.createTransport({
  service: 'Gmail',
  host: 'smtp.gmail.com',
  port: 465,
  secure: false,
  auth: {
    user: 'developerhb15@gmail.com',
    pass: process.env.NODEMAILER,
  },
});

export default transporter;
