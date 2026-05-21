import jwt from "jsonwebtoken";
import response from "../config/responseHandler.js";

const authMiddleware = (req, res, next) => {
  try {
    /*  1. Get token from cookie */
    const auth_token = req.cookies.auth_token;
    if (!auth_token) {
      return response(res, 401, "Access denied. No token provided");
    }

    /* 2. Verify token */
    const decoded = jwt.verify(auth_token, process.env.JWT_SECRET);

    /* 3. Attach user data to request  */
    req.user = decoded;
    next();
  } catch (error) {
    console.error(error.message, "Error Message");
    return response(res, 401, "Invalid or expired token");
  }
};

export default authMiddleware;
