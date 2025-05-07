import { Admin } from 'mongodb';
import mongoose from 'mongoose';

// Define the schema
const userSchema = new mongoose.Schema(
  {
    alias: {
      type: String,
      required: false,
    },
    username: {
      type: String,
      required: true,
      unique: true,
    },
    firstname: {
      type: String,
      required: true,
    },
    lastname: {
      type: String,
      required: false,
    },
    email: {
      type: String,
      required: true,
      unique: true,
      validate: {
        validator: function (v) {
          return /\S+@\S+\.\S+/.test(v);
        },
        message: (props) => `${props.value} is not a valid email!`,
      },
    },
    phone: {
      type: String,
      required: false,
      validate: {
        validator: function (v) {
          return /^\d+$/.test(v);
        },
        message: (props) => `${props.value} is not a valid phone number!`,
      },
    },
    address: {
      type: String,
      required: false,
    },
    otherDetails: {
      type: mongoose.Schema.Types.Mixed, // Use Mixed type for JSON
      required: false,
    },
    password: {
      type: String,
      required: false,
    },
    freez: {
      type: Boolean,
      required: false,
    },
    role: {
      User: {
        default: 2001,
        type: Number,
      },
      Admin: Number,
      Moderator: Number,
    },
    flaggedComments: {
      amount: {
        type: Number,
        default: 0,
      },
    },
    refreshToken: {
      type: String,
      maxlength: 1500,
      required: false,
    },
    googleId: {
      type: String,
      sparse: true,
    },
    photo: {
      type: String,
    },
  },
  {
    collection: 'users',
    timestamps: true,
  }
);

// Define static methods for associations, if needed
userSchema.statics.associate = function (models) {
  // If you need to define relationships, you can do so here
  // But typically in Mongoose, you use refs in the schema itself
};

// Use singleton pattern to prevent model recompilation
export default mongoose.models.User || mongoose.model('User', userSchema);
