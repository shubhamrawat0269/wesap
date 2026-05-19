import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import User from "../models/user.model.js";
import { otpGenerator } from "../config/otpgenerator.js";
import response from "../config/responseHandler.js";
import { sendOtpToEmail } from "../services/email.service.js";
import { sendPhoneOtp, verifyPhoneOtp } from "../services/otp.service.js";
import { generateToken } from "../config/generateToken.js";

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
      if (result.status !== "approved")
        return response(res, 400, "Invalid Otp");

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

export { sendOtp, verifyOtp };
