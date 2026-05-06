import jwt from "jsonwebtoken";

const authMiddleware = (req, res, next) => {
  try {
    /*  1. Get token from header */
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res.status(401).json({
        status: false,
        message: "Access denied. No token provided",
      });
    }

    const token = authHeader.split(" ")[1];

    // 2. Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // 3. Attach user data to request
    req.user = decoded;
    next();
  } catch (error) {
    console.error(error.message);
    return res.status(401).json({
      status: false,
      message: "Invalid or expired token",
    });
  }
};

export default authMiddleware;
