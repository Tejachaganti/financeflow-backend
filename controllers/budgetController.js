import Budget from "../models/Budget.js";
import Expense from "../models/Expense.js";
import Income from "../models/Income.js";

export const getBudget = async (req, res, next) => {
  try {
    const budget = await Budget.findOne({ user: req.user._id });
    res.json({ success: true, budget });
  } catch (error) {
    next(error);
  }
};

export const updateBudget = async (req, res, next) => {
  try {
    const budget = await Budget.findOneAndUpdate({ user: req.user._id }, req.body, { new: true, upsert: true });
    res.json({ success: true, budget });
  } catch (error) {
    next(error);
  }
};

export const getBudgetSnapshot = async (req, res, next) => {
  try {
    const now = new Date();
    const start = new Date(now.getFullYear(), now.getMonth(), 1);
    const end = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59, 999);

    const [budget, expenses, incomes] = await Promise.all([
      Budget.findOne({ user: req.user._id }),
      Expense.find({ user: req.user._id, date: { $gte: start, $lte: end } }),
      Income.find({ user: req.user._id, date: { $gte: start, $lte: end } })
    ]);

    const spent = expenses.reduce((sum, item) => sum + item.amount, 0);
    const earned = incomes.reduce((sum, item) => sum + item.amount, 0);
    const monthlyBudget = budget?.monthlyBudget || 0;

    res.json({
      success: true,
      snapshot: {
        monthlyBudget,
        spent,
        remaining: monthlyBudget - spent,
        savings: earned - spent,
        budgetUsedPercent: monthlyBudget ? (spent / monthlyBudget) * 100 : 0
      }
    });
  } catch (error) {
    next(error);
  }
};
