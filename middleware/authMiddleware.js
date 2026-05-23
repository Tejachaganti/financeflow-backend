import jwt from "jsonwebtoken";
import User from "../models/User.js";

export const protect = async (req, _res, next) => {
  try {
    const authHeader = req.headers.authorization;
    const token = authHeader?.startsWith("Bearer ") ? authHeader.split(" ")[1] : null;

    if (!token) {
      const error = new Error("Not authorized, token missing.");
      error.statusCode = 401;
      throw error;
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = await User.findById(decoded.id).select("-password");

    if (!req.user) {
      const error = new Error("User not found.");
      error.statusCode = 401;
      throw error;
    }

    next();
  } catch (error) {
    error.statusCode = error.statusCode || 401;
    next(error);
  }
};
