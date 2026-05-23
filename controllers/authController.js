import User from "../models/User.js";
import Budget from "../models/Budget.js";
import generateToken from "../utils/generateToken.js";

export const registerUser = async (req, res, next) => {
  try {
    const { name, email, password } = req.body;
    if (!name || !email || !password) {
      const error = new Error("Name, email, and password are required.");
      error.statusCode = 400;
      throw error;
    }

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      const error = new Error("User already exists.");
      error.statusCode = 409;
      throw error;
    }

    const user = await User.create({ name, email, password });
    await Budget.create({ user: user._id });

    res.status(201).json({
      success: true,
      token: generateToken(user._id),
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        currency: user.currency,
        theme: user.theme,
        avatar: user.avatar
      }
    });
  } catch (error) {
    next(error);
  }
};

export const loginUser = async (req, res, next) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email });

    if (!user || !(await user.matchPassword(password))) {
      const error = new Error("Invalid credentials.");
      error.statusCode = 401;
      throw error;
    }

    res.json({
      success: true,
      token: generateToken(user._id),
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        currency: user.currency,
        theme: user.theme,
        avatar: user.avatar
      }
    });
  } catch (error) {
    next(error);
  }
};

export const getCurrentUser = async (req, res) => {
  res.json({ success: true, user: req.user });
};
