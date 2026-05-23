import User from "../models/User.js";
import Income from "../models/Income.js";

export const getProfile = async (req, res) => {
  res.json({ success: true, profile: req.user });
};

export const updateProfile = async (req, res, next) => {
  try {
    const user = await User.findById(req.user._id);
    if (!user) {
      const error = new Error("User not found.");
      error.statusCode = 404;
      throw error;
    }

    user.name = req.body.name || user.name;
    user.currency = req.body.currency || user.currency;
    user.theme = req.body.theme || user.theme;
    user.monthlySavingsGoal = req.body.monthlySavingsGoal ?? user.monthlySavingsGoal;

    if (req.file) {
      user.avatar = `/uploads/${req.file.filename}`;
    }

    const updatedUser = await user.save();
    res.json({
      success: true,
      profile: {
        id: updatedUser._id,
        name: updatedUser.name,
        email: updatedUser.email,
        currency: updatedUser.currency,
        theme: updatedUser.theme,
        avatar: updatedUser.avatar,
        monthlySavingsGoal: updatedUser.monthlySavingsGoal
      }
    });
  } catch (error) {
    next(error);
  }
};

export const getIncome = async (req, res, next) => {
  try {
    const incomes = await Income.find({ user: req.user._id }).sort({ date: -1 });
    res.json({ success: true, incomes });
  } catch (error) {
    next(error);
  }
};

export const createIncome = async (req, res, next) => {
  try {
    const income = await Income.create({ ...req.body, user: req.user._id });
    res.status(201).json({ success: true, income });
  } catch (error) {
    next(error);
  }
};
