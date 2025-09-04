import nodemailer from 'nodemailer';
import { config } from 'dotenv'; // Make sure you have this installed
config(); // Load environment variables from .env file

export const accountEmail = 'utkarshsharma9571@gmail.com';

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: accountEmail,
    pass: process.env.EMAIL_PASSWORD, // Access the variable from process.env
  },
});

export default transporter;
