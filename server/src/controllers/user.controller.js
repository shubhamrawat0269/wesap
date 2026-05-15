import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import User from "../models/user.model.js";

const sendOtp = async (req, res) => {
  try {
  } catch (error) {
    console.error(error.message);
    res.status(500).json({
      status: false,
      message: "Server error",
      error: error.message,
    });
  }
};

export { sendOtp };
