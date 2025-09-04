import { Router } from 'express';
import {
  signIn,
  signUp,
  verifyEmails,
  resendEmailVerification,
  forgotPassword,
  resetPassword,
  googleAuth,
  githubAuth,
} from '../controllers/auth.controller.js';

console.log('Auth router file is processing a request.');

const authRouter = Router();

authRouter.post('/sign-up', signUp);
authRouter.post('/sign-in', signIn);
authRouter.get('/verify-email', verifyEmails);
authRouter.post('/resend-verification', resendEmailVerification);
authRouter.post('/forgot-password', forgotPassword);
authRouter.post('/reset-password', resetPassword);
authRouter.post('/google', googleAuth);
authRouter.all('/github', githubAuth);

export default authRouter;
