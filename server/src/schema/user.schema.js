import mongoose from "mongoose";

const userSchema = new mongoose.Schema(
  {
    username: {
      type: String,
      trim: true,
      minlength: [3, "Username must be at least 3 characters"],
      maxlength: [30, "Username cannot exceed 30 characters"],
    },
    email: {
      type: String,
      unique: true,
      lowercase: true,
      trim: true,
      validate: {
        validator: function (value) {
          return /^\S+@\S+\.\S+$/.test(value);
        },
        message: "Please enter a valid email",
      },
    },
    emailOtp: {
      type: String,
    },
    emailOtpExpiry: {
      type: Date,
    },
    lastSeen: {
      type: Date,
    },
    profilePicture: {
      type: String,
      default: "",
    },
    about: {
      type: String,
      maxlength: [150, "About cannot exceed 150 characters"],
      trim: true,
      default: "",
    },
    isOnline: {
      type: Boolean,
      default: false,
    },
    isVerified: {
      type: Boolean,
      default: false,
    },
    phoneNumber: {
      type: String,
      unique: true,
      sparse: true,
      validate: {
        validator: function (value) {
          return /^[0-9]{10,15}$/.test(value);
        },
        message: "Invalid phone number",
      },
    },
    phoneSuffix: {
      type: String,
      unique: false,
    },
    agreed: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true },
);

export default userSchema;
