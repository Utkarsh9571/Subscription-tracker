import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import crypto from 'crypto';
import dotenv from 'dotenv';
import axios from 'axios';

import User from '../models/user.model.js';
import {
  FRONTEND_REDIRECT_URI,
  GITHUB_CLIENT_ID,
  GITHUB_CLIENT_SECRET,
  JWT_EXPIRES_IN,
  JWT_SECRET,
} from '../config/env.js';
import {
  sendVerificationEmail,
  resetPasswordEmail,
} from '../utils/send-email.js';
import { GOOGLE_CLIENT_ID } from '../config/env.js';

dotenv.config();

const expressModule = await import('express');
const express = expressModule.default;

// The 'google-auth-library' is also a CommonJS library, so we must
// use the dynamic import() for it as well.
const googleAuthLibrary = await import('google-auth-library');
const OAuth2Client = googleAuthLibrary.OAuth2Client;

export const signUp = async (req, res, next) => {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const { firstName, lastName, email, password } = req.body;

    // Check if user already exists
    const existingUser = await User.findOne({ email });

    if (existingUser) {
      const error = new Error('User already exists');
      error.statusCode = 409;
      throw error;
    }

    // Hash password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const verificationToken = crypto.randomBytes(32).toString('hex');
    const verificationTokenExpires = Date.now() + 60 * 60 * 1000;

    const newUser = await User.create(
      [
        {
          firstName,
          lastName,
          email,
          password: hashedPassword,
          status: 'unverified',
          verificationToken: verificationToken,
          verificationTokenExpires: verificationTokenExpires,
          isSocialUser: false,
        },
      ],
      { session },
    );

    const verificationLink = `http://localhost:3000/verify-email?token=${verificationToken}`;
    await sendVerificationEmail({ to: newUser[0].email, verificationLink });

    // JWT is now generated for the response
    const token = jwt.sign({ userId: newUser[0]._id }, JWT_SECRET, {
      expiresIn: JWT_EXPIRES_IN,
    });

    await session.commitTransaction();
    session.endSession();

    // CORRECTED: changed the cookie name from 'token' to 'jwt'
    res.cookie('token', token, {
      httpOnly: true,
      //secure: false, // use them in production
      //sameSite: 'strict', // use them in production
      path: '/',
    });

    res.status(201).json({
      success: true,
      message: 'User created successfully',
      data: {
        token, // The token is sent in the response body
        user: newUser[0],
      },
    });
  } catch (error) {
    await session.abortTransaction();
    session.endSession();
    next(error);
  }
};

export const signIn = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email });

    if (!user) {
      const error = new Error('User not found');
      error.statusCode = 404;
      throw error;
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);

    if (!isPasswordValid) {
      const error = new Error('Invalid Password');
      error.statusCode = 401;
      throw error;
    }

    if (user.status !== 'verified') {
      const error = new Error('Please verify your email to continue');
      error.statusCode = 403;
      throw error;
    }

    // The key change: Generate and send the JWT in the response body
    const token = jwt.sign({ userId: user._id }, JWT_SECRET, {
      expiresIn: JWT_EXPIRES_IN,
    });

    // CORRECTED: changed the cookie name from 'token' to 'jwt'
    res.cookie('token', token, {
      httpOnly: true,
      //secure: false, // use them in production
      //sameSite: 'strict', // use them in production
      path: '/',
    });

    res.status(200).json({
      success: true,
      message: 'User signed in successfully',
      data: {
        token,
        user,
      },
    });
  } catch (error) {
    next(error);
  }
};

export const verifyEmails = async (req, res, next) => {
  try {
    const user = await User.findOne({
      verificationToken: req.query.token,
      verificationTokenExpires: { $gt: new Date() },
    });

    if (!user) {
      return res.redirect(
        'http://192.168.29.162:3000/signin?verification=failed',
      );
    }

    user.status = 'verified';

    user.verificationToken = undefined;
    user.verificationTokenExpires = undefined;

    await user.save();

    // The key change: Generate a JWT for the verified user
    const token = jwt.sign({ userId: user._id }, JWT_SECRET, {
      expiresIn: JWT_EXPIRES_IN,
    });

    // CORRECTED: changed the cookie name from 'token' to 'jwt'
    res.cookie('token', token, {
      httpOnly: true,
      //secure: false, // use them in production
      //sameSite: 'strict', // use them in production
      path: '/',
    });

    return res.status(200).json({
      success: true,
      message: 'Email verified successfully.',
      token: token,
    });
  } catch (error) {
    next(error);
  }
};

export const resendEmailVerification = async (req, res, next) => {
  try {
    const { email } = req.body;
    const user = await User.findOne({ email });

    if (!user) {
      const error = new Error('User not found');
      error.statusCode = 404;
      throw error;
    }

    if (user.status === 'verified') {
      const error = new Error(
        'User already verified, no need to resend verification link',
      );
      error.status = 409;
      throw error;
    }

    const verificationToken = crypto.randomBytes(32).toString('hex');
    const verificationTokenExpires = Date.now() + 60 * 60 * 1000;

    user.verificationToken = verificationToken;
    user.verificationTokenExpires = verificationTokenExpires;

    await user.save();

    const verificationLink = `http://localhost:3000/verify-email?token=${verificationToken}`;
    await sendVerificationEmail({ to: user.email, verificationLink });

    return res
      .status(200)
      .json({ message: 'Verification email resent successfully' });
  } catch (error) {
    next(error);
  }
};

export const forgotPassword = async (req, res, next) => {
  try {
    const { email } = req.body;

    const user = await User.findOne({ email });

    if (user) {
      const verificationToken = crypto.randomBytes(32).toString('hex');
      const verificationTokenExpires = Date.now() + 60 * 60 * 1000;

      user.verificationToken = verificationToken;
      user.verificationTokenExpires = verificationTokenExpires;

      await user.save();

      const resetPasswordLink = `http://localhost:3000/reset-password?token=${verificationToken}`;
      await resetPasswordEmail({
        to: user.email,
        resetPasswordLink,
      });
    }

    return res.status(200).json({
      message:
        'If an account with that email exists, a reset link has been sent.',
    });
  } catch (error) {
    next(error);
  }
};

export const resetPassword = async (req, res, next) => {
  try {
    const { token } = req.body;
    const { newPassword } = req.body;

    if (!token) {
      const error = new Error('Missing token');
      error.statusCode = 400;
      throw error;
    }

    const user = await User.findOne({
      verificationToken: token,
      verificationTokenExpires: { $gt: new Date() },
    });

    if (!user) {
      const error = new Error('Bad request');
      error.statusCode = 400;
      throw error;
    }

    if (!newPassword) {
      const error = new Error('Missing new password.');
      error.statusCode = 400;
      throw error;
    }

    if (user.isSocialUser) {
      user.isSocialUser = false;
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(newPassword, salt);

    user.verificationToken = undefined;
    user.verificationTokenExpires = undefined;

    user.password = hashedPassword;

    await user.save();

    res.status(200).json({
      success: true,
      message: 'Password successfully reset',
    });
  } catch (error) {
    next(error);
  }
};

export const googleAuth = async (req, res, next) => {
  const session = await mongoose.startSession();

  try {
    session.startTransaction();

    const { token } = req.body;

    if (!token) {
      const error = new Error('id token not recieved');
      error.statusCode = 400;
      throw error;
    }

    const CLIENT_ID = GOOGLE_CLIENT_ID;
    const client = new OAuth2Client(CLIENT_ID);

    const ticket = await client.verifyIdToken({
      idToken: token,
      audience: CLIENT_ID, // CLIENT_ID of the app that accesses the backend
    });

    const payload = ticket.getPayload();

    const { given_name, family_name, email } = payload;
    const user = await User.findOne({ email });

    const randomPassword = Math.random().toString(36).slice(-8);

    if (!user) {
      const newUser = await User.create(
        [
          {
            firstName: given_name,
            lastName: family_name,
            email,
            password: randomPassword,
            status: 'verified',
            verificationToken: undefined,
            verificationTokenExpires: undefined,
            isSocialUser: true,
          },
        ],
        { session },
      );

      const jwtToken = jwt.sign({ userId: newUser[0]._id }, JWT_SECRET, {
        expiresIn: JWT_EXPIRES_IN,
      });

      await session.commitTransaction();

      // CORRECTED: changed the cookie name from 'token' to 'jwt'
      res.cookie('token', jwtToken, {
        httpOnly: true,
        //secure: false, // use them in production
        //sameSite: 'strict', // use them in production
        path: '/',
      });

      res.status(201).json({
        success: true,
        message: 'User successfully created',
        data: {
          token: jwtToken,
          user: newUser[0],
        },
      });
    } else {
      const jwtToken = jwt.sign({ userId: user._id }, JWT_SECRET, {
        expiresIn: JWT_EXPIRES_IN,
      });

      await session.commitTransaction();

      // CORRECTED: changed the cookie name from 'token' to 'jwt'
      res.cookie('token', jwtToken, {
        httpOnly: true,
        //secure: false, // use them in production
        //sameSite: 'strict', // use them in production
        path: '/',
      });

      res.status(200).json({
        success: true,
        message: 'Google signin successful',
        data: {
          token: jwtToken,
          user,
        },
      });
    }
  } catch (error) {
    // Abort the transaction if any error occurs
    await session.abortTransaction();
    next(error);
  } finally {
    // Always end the session
    session.endSession();
  }
};

export const githubAuth = async (req, res, next) => {
  const session = await mongoose.startSession();

  try {
    session.startTransaction();
    const { code, state } = req.body;

    if (!code) {
      const error = new Error('Authorization code not received');
      error.statusCode = 400;
      throw error;
    }

    // Step 1: Exchange the temporary code for a GitHub access token.
    let accessToken;
    try {
      const tokenResponse = await axios.post(
        'https://github.com/login/oauth/access_token',
        {
          client_id: GITHUB_CLIENT_ID,
          client_secret: GITHUB_CLIENT_SECRET,
          code,
          redirect_uri: FRONTEND_REDIRECT_URI,
          state,
        },
        {
          headers: {
            Accept: 'application/json',
          },
        },
      );

      accessToken = tokenResponse.data.access_token;
      if (!accessToken) {
        const error = new Error('Failed to retrieve GitHub access token');
        error.statusCode = 400;
        throw error;
      }
    } catch (axiosError) {
      if (axiosError.response) {
      } else if (axiosError.request) {
        console.error('No response received from GitHub:', axiosError.request);
      } else {
        console.error('Axios error message:', axiosError.message);
      }
      throw new Error('Failed to exchange code for access token.');
    }

    // Step 2: use the access token to retrieve the user data from the GitHub API.
    const userResponse = await axios.get('https://api.github.com/user', {
      headers: {
        Authorization: `token ${accessToken}`,
      },
    });

    const emailResponse = await axios.get(
      'https://api.github.com/user/emails',
      {
        headers: {
          Authorization: `token ${accessToken}`,
        },
      },
    );

    const githubUser = userResponse.data;
    const githubEmail = emailResponse.data;
    const primaryEmail = githubEmail.find(
      (email) => email.primary && email.verified,
    );

    if (!primaryEmail) {
      const error = new Error(
        'Cannot find a verified primary email from GitHub',
      );
      error.statusCode = 400;
      throw error;
    }

    // Step 3: handle the user creation or login
    const user = await User.findOne({ email: primaryEmail.email });
    const randomPassword = Math.random().toString(36).slice(-8);

    if (!user) {
      const newUser = await User.create(
        [
          {
            firstName: githubUser.name || githubUser.login,
            lastName: '',
            email: primaryEmail.email,
            password: randomPassword,
            status: 'verified',
            verificationToken: undefined,
            verificationTokenExpires: undefined,
            isSocialUser: true,
          },
        ],
        { session },
      );

      const jwtToken = jwt.sign({ userId: newUser[0]._id }, JWT_SECRET, {
        expiresIn: JWT_EXPIRES_IN,
      });

      await session.commitTransaction();

      // CORRECTED: Added the missing res.cookie() call
      res.cookie('token', jwtToken, {
        httpOnly: true,
        //secure: false, // use them in production
        //sameSite: 'strict', // use them in production
        path: '/',
      });

      res.status(200).json({
        success: true,
        message: 'User successfully created',
        data: {
          token: jwtToken,
          user: newUser[0],
        },
      });
    } else {
      const jwtToken = jwt.sign({ userId: user._id }, JWT_SECRET, {
        expiresIn: JWT_EXPIRES_IN,
      });

      await session.commitTransaction();

      // CORRECTED: changed the cookie name from 'token' to 'jwt'
      res.cookie('token', jwtToken, {
        httpOnly: true,
        //secure: false, // use them in production
        //sameSite: 'strict', // use them in production
        path: '/',
      });

      res.status(200).json({
        success: true,
        message: 'GitHub signin successful',
        data: {
          token: jwtToken,
          user,
        },
      });
    }
  } catch (error) {
    await session.abortTransaction();
    console.error('Main authentication error:', error.message);
    next(error);
  } finally {
    session.endSession();
  }
};
