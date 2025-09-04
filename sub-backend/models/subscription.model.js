import mongoose from 'mongoose';

const subscriptionSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Subscription name is required'],
      trim: true,
      minLength: 2,
      maxLength: 100,
    },
    price: {
      type: Number,
      required: [true, 'Price is required'],
      min: [0, 'Price must be greater than 0'],
    },
    currency: {
      type: String,
      enum: ['USD', 'EUR', 'INR'],
      default: 'USD',
    },
    frequency: {
      type: String,
      enum: ['daily', 'weekly', 'monthly', 'yearly'],
    },
    category: {
      type: String,
      enum: [
        'Streaming',
        'Software/Tools',
        'Gaming',
        'News/Media',
        'Education',
        'Health/Fitness',
        'Finance',
        'Shopping',
        'Food',
        'Utilities',
        'Other',
      ],
      required: true,
    },
    paymentMethod: {
      type: String,
      required: true,
      enum: ['Credit Card', 'Debit Card', 'Wallets', 'Crypto'],
      trim: true,
    },
    status: {
      type: String,
      enum: ['active', 'cancelled', 'expired'],
      default: 'active',
    },
    startDate: {
      type: Date,
      required: true,
      validate: {
        validator: (value) => value <= new Date(),
        message: 'Start date must be in the past',
      },
    },
    renewalDate: {
      type: Date,
      validate: {
        validator: function (value) {
          return value > this.startDate;
        },
        message: 'Renewal date must be after the start date',
      },
    },
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
  },
  { timestamps: true },
);

// Corrected pre('save') middleware
subscriptionSchema.pre('save', function (next) {
  // Auto-calculate renewal date if missing.
  if (!this.renewalDate && this.isNew) {
    const renewalPeriods = {
      daily: () => this.renewalDate.setDate(this.renewalDate.getDate() + 1),
      weekly: () => this.renewalDate.setDate(this.renewalDate.getDate() + 7),
      monthly: () => this.renewalDate.setMonth(this.renewalDate.getMonth() + 1),
      yearly: () =>
        this.renewalDate.setFullYear(this.renewalDate.getFullYear() + 1),
    };

    this.renewalDate = new Date(this.startDate);

    if (this.frequency in renewalPeriods) {
      renewalPeriods[this.frequency]();
    }
  }

  // Auto-update the status if renewal date has passed
  if (this.renewalDate && this.renewalDate < new Date()) {
    this.status = 'expired';
  }

  next();
});

const Subcription = mongoose.model('Subscription', subscriptionSchema);

export default Subcription;
