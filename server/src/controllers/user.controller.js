import bcrypt from "bcrypt";
import fs from "fs";
import jwt from "jsonwebtoken";
import User from "../models/user.model.js";
import { otpGenerator } from "../config/otpgenerator.js";
import response from "../config/responseHandler.js";
import { sendOtpToEmail } from "../services/email.service.js";
import { sendPhoneOtp, verifyPhoneOtp } from "../services/otp.service.js";
import { generateToken } from "../config/generateToken.js";
import uploadOnCloudinary from "../services/cloudinary.service.js";
import Conversation from "../models/conversation.model.js";

/*
 * TODO TASK:
 * 1. Get email or phone from frontend
 * 2. Generate OTP
 * 3. Create/find user
 * 4. Save OTP (for email)
 * 5. Send OTP
 * 6. Return response
 */

const sendOtp = async (req, res) => {
  try {
    const { phoneNumber, phoneSuffix, email } = req.body;

    const otp = otpGenerator();
    const expiry = new Date(Date.now() + 5 * 60 * 1000);
    let user;

    if (email) {
      user = await User.findOne({ email });

      if (!user) user = new User({ email });
      user.emailOtp = otp;
      user.emailOtpExpiry = expiry;
      await user.save();
      await sendOtpToEmail(email, otp);
      return response(res, 200, "Otp send to your email", email);
    }
    if (!phoneNumber || !phoneSuffix) {
      return response(res, 400, "Phone Number and PhoneSuffix are required.");
    }
    const fullPhoneNumber = `${phoneSuffix}${phoneNumber}`;
    user = await User.findOne({ phoneNumber });

    if (!user) {
      user = await new User({ phoneNumber, phoneSuffix });
    }

    await sendPhoneOtp(fullPhoneNumber);
    await user.save();
    return response(res, 200, "Otp send successfully.", user);
  } catch (error) {
    console.error(error.message);
    return response(res, 500, "Internal Server Error");
  }
};

// Verify Otp
const verifyOtp = async (req, res) => {
  const { phoneNumber, phoneSuffix, email, otp } = req.body;

  try {
    let user;
    if (email) {
      user = await User.findOne({ email });
      if (!user) return response(res, 404, "User Not Found");

      const now = new Date();
      if (
        !user.emailOtp ||
        String(user.emailOtp) !== String(otp) ||
        now > new Date(user.emailOtpExpiry)
      ) {
        return response(res, 400, "Invalid or Expired Otp");
      }

      user.isVerified = true;
      user.emailOtp = null;
      user.emailOtpExpiry = null;
      await user.save();
    } else {
      if (!phoneNumber || !phoneSuffix) {
        return response(res, 400, "Phone Number and PhoneSuffix are required.");
      }

      const fullPhoneNumber = `${phoneSuffix}${phoneNumber}`;
      user = await User.findOne({ phoneNumber });

      if (!user) {
        return response(res, 404, "User Not Found");
      }

      const result = await verifyPhoneOtp(fullPhoneNumber, otp);
      if (!result || result.status !== "approved") {
        return response(res, 400, "Invalid or Expired Otp");
      }

      user.isVerified = true;
      await user.save();
    }

    const token = generateToken(user?._id);
    res.cookie("auth_token", token, {
      httpOnly: true,
      maxAge: 1000 * 60 * 60 * 24 * 365,
    });
    return response(res, 200, "Otp verified successfully", { token, user });
  } catch (error) {
    console.error(error.message);
    return response(res, 500, "Internal Server Error");
  }
};

// profile update logic
/*
 * Frontend sends file
 * Multer stores temporarily
 * Controller receives req.file
 * Upload file manually to Cloudinary
 * Get secure_url
 * Save URL in MongoDB
 * Delete local temp file
 */

const updateProfile = async (req, res) => {
  const { username, agreed, about, profilePicture } = req.body;
  const userId = req.user.userId;

  try {
    const user = await User.findById(userId);
    if (!user) {
      return response(res, 404, "User not found");
    }
    const file = req.file;

    if (file) {
      try {
        const uploadedImage = await uploadOnCloudinary(file.path);
        // Save image URL
        if (uploadedImage) {
          user.profilePicture = uploadedImage.secure_url;
        }
      } finally {
        // Delete local file
        if (file.path) await fs.promises.unlink(file.path);
      }
    } else if (profilePicture) {
      user.profilePicture = profilePicture;
    }

    // Update fields
    if (username !== undefined) user.username = username;
    if (about !== undefined) user.about = about;
    if (agreed !== undefined) user.agreed = agreed;

    await user.save();
    return response(res, 200, "Profile updated successfully", user);
  } catch (error) {
    console.error(error.message);
    return response(res, 500, "Internal Server Error");
  }
};

const checkAuthenticated = async (req, res) => {
  try {
    const userId = req.user.userId;
    if (!userId) {
      return response(res, 404, "Please Login before accessing feature");
    }
    const user = await User.findById(userId);
    if (!user) return response(res, 404, "User Not Found");

    return response(
      res,
      200,
      "User Found !! Allowed to use our application",
      user,
    );
  } catch (error) {
    console.error(error.message);
    return response(res, 500, "Internal Server Error");
  }
};

const userLogout = (req, res) => {
  try {
    res.cookie("auth_token", "", { expries: new Date(0) });
    return response(res, 200, "User Logout Successfully");
  } catch (error) {
    console.error(error.message);
    return response(res, 500, "Internal Server Error");
  }
};

const getAllUsers = async (req, res) => {
  const loggedInUser = req.user.userId;
  try {
    const users = await User.find({ _id: { $ne: loggedInUser } })
      .select(
        "username profilePicture lastSeen isOnline about phoneNumber phoneSuffix",
      )
      .lean();

    const usersWithConversation = await Promise.all(
      users.map(async (user) => {
        const conversation = await Conversation.findOne({
          participants: { $all: [loggedInUser, user._id] },
        })
          .populate({
            path: "lastMessage",
            select: "content createdAt sender receiver",
          })
          .lean();

        return {
          ...user,
          conversation: conversation || null,
        };
      }),
    );

    return response(
      res,
      200,
      "User Retrieved Successfully",
      usersWithConversation,
    );
  } catch (error) {
    console.error(error.message);
    return response(res, 500, "Internal Server Error");
  }
};

export {
  sendOtp,
  verifyOtp,
  userLogout,
  getAllUsers,
  updateProfile,
  checkAuthenticated,
};
