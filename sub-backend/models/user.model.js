import mongoose from 'mongoose';

const userSchema = new mongoose.Schema(
  {
    firstName: {
      type: String,
      required: [true, 'First Name is required'],
      trim: true,
      minlength: 2,
      maxlength: 50,
    },
    lastName: {
      type: String,
      trim: true,
      default: null,
      maxlength: 50,
    },
    email: {
      type: String,
      required: [true, 'User Email is required'],
      unique: true,
      trim: true,
      lowercase: true,
      minlength: 5,
      maxlength: 255,
      match: [/\S+@\S+\.\S+/, 'Please fill a valid email address'],
    },
    password: {
      type: String,
      required: [true, 'User Password is required'],
      minlength: 6,
    },
    phone: {
      type: String,
      trim: true,
      default: null,
    },
    bio: {
      type: String,
      trim: true,
      default: null,
    },
    status: {
      type: String,
      enum: ['verified', 'unverified'],
      default: 'unverified',
    },
    verificationToken: {
      type: String,
    },
    verificationTokenExpires: {
      type: Date,
    },
    isSocialUser: {
      type: Boolean,
      default: false,
    },
    phone: {
      type: String,
      trim: true,
      default: null,
    },
    socials: {
      facebook: {
        type: String,
        required: false,
        default: null,
      },
      twitter: {
        type: String,
        required: false,
        default: null,
      },
      linkedin: {
        type: String,
        required: false,
        default: null,
      },
      instagram: {
        type: String,
        required: false,
        default: null,
      },
    },
  },
  { timestamps: true },
);

userSchema.index({ verificationToken: 1 }, { unique: true, sparse: true });

const User = mongoose.model('User', userSchema);

export default User;
