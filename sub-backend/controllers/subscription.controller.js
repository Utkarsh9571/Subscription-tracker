import { workflowClient } from '../config/upstash.js';
import Subscription from '../models/subscription.model.js';
import { SERVER_URL } from '../config/env.js';

export const createSubscription = async (req, res, next) => {
  try {
    const subscription = await Subscription.create({
      ...req.body,
      user: req.user.id,
    });

    const { workflowRunId } = await workflowClient.trigger({
      url: `${SERVER_URL}/api/v1/workflows/subscription/reminder`,
      body: {
        subscriptionId: subscription.id,
      },
      headers: {
        'content-type': 'application/json',
      },
      retries: 0,
    });

    res
      .status(201)
      .json({ success: true, data: { subscription, workflowRunId } });
  } catch (e) {
    console.error('An error occurred in the createSubscription controller:');
    next(e);
  }
};

export const getUserSubscriptions = async (req, res, next) => {
  try {
    const subscriptions = await Subscription.find({ user: req.user.id });

    res.status(200).json({ success: true, data: { subscriptions } });
  } catch (error) {
    next(error);
  }
};

export const deleteSubscriptions = async (req, res, next) => {
  try {
    const subscription = await Subscription.findByIdAndDelete(req.params.id);

    if (!subscription) {
      const error = new Error('no subscription found');
      error.statusCode = 404;
      throw error;
    }

    res.status(200).json({ success: true, message: 'subscription deleted' });
  } catch (error) {
    next(error);
  }
};

export const cancelSubscription = async (req, res, next) => {
  try {
    const cancelSubscription = await Subscription.findByIdAndUpdate(
      req.params.id,
      { status: 'cancelled' },
      { new: true },
    );

    res.status(200).json({ success: true, data: { cancelSubscription } });
  } catch (error) {
    next(error);
  }
};

export const upcomingRenewals = async (req, res, next) => {
  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const nextWeek = new Date();
    nextWeek.setDate(today.getDate() + 7);
    nextWeek.setHours(23, 59, 59, 999);

    const upcomingRenewals = await Subscription.find({
      user: req.user.id,
      status: 'active',
      renewalDate: { $gte: today, $lte: nextWeek },
    });

    res.status(200).json({ success: true, data: { upcomingRenewals } });
  } catch (error) {
    next(error);
  }
};
