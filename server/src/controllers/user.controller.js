import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import User from "../models/user.model.js";
import { otpGenerator } from "../config/otpgenerator.js";
import response from "../config/responseHandler.js";

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

    await user.save();
    return response(res, 200, "Otp send successfully.", user);
  } catch (error) {
    console.error(error.message);
    return response(res, 500, "Internal Server Error");
  }
};

export { sendOtp };
