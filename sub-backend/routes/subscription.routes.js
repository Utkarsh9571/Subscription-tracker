import { Router } from 'express';
import authorize from '../middlewares/auth.middleware.js';
import verify from '../middlewares/isVerified.middleware.js';
import {
  createSubscription,
  getUserSubscriptions,
  deleteSubscriptions,
  cancelSubscription,
  upcomingRenewals,
} from '../controllers/subscription.controller.js';

const subscriptionRouter = Router();

subscriptionRouter.get('/', authorize, verify, getUserSubscriptions);

subscriptionRouter.post('/', authorize, verify, createSubscription);

subscriptionRouter.delete(
  '/:id/delete',
  authorize,
  verify,
  deleteSubscriptions,
);

subscriptionRouter.put('/:id/cancel', authorize, verify, cancelSubscription);

subscriptionRouter.get(
  '/upcoming-renewals',
  authorize,
  verify,
  upcomingRenewals,
);

export default subscriptionRouter;
