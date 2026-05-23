import Expense from "../models/Expense.js";
import { buildExpenseFilters, getSortOption } from "../utils/queryHelpers.js";

export const getExpenses = async (req, res, next) => {
  try {
    const filters = buildExpenseFilters(req.query, req.user._id);
    const sort = getSortOption(req.query.sortBy, req.query.order);
    const expenses = await Expense.find(filters).sort(sort);
    res.json({ success: true, expenses });
  } catch (error) {
    next(error);
  }
};

export const getExpenseById = async (req, res, next) => {
  try {
    const expense = await Expense.findOne({ _id: req.params.id, user: req.user._id });
    if (!expense) {
      const error = new Error("Expense not found.");
      error.statusCode = 404;
      throw error;
    }
    res.json({ success: true, expense });
  } catch (error) {
    next(error);
  }
};

export const createExpense = async (req, res, next) => {
  try {
    const payload = { ...req.body, user: req.user._id };
    if (req.file) {
      payload.receiptUrl = `/uploads/${req.file.filename}`;
    }
    const expense = await Expense.create(payload);
    res.status(201).json({ success: true, expense });
  } catch (error) {
    next(error);
  }
};

export const updateExpense = async (req, res, next) => {
  try {
    const expense = await Expense.findOne({ _id: req.params.id, user: req.user._id });
    if (!expense) {
      const error = new Error("Expense not found.");
      error.statusCode = 404;
      throw error;
    }

    Object.assign(expense, req.body);
    if (req.file) {
      expense.receiptUrl = `/uploads/${req.file.filename}`;
    }

    const updatedExpense = await expense.save();
    res.json({ success: true, expense: updatedExpense });
  } catch (error) {
    next(error);
  }
};

export const deleteExpense = async (req, res, next) => {
  try {
    const expense = await Expense.findOneAndDelete({ _id: req.params.id, user: req.user._id });
    if (!expense) {
      const error = new Error("Expense not found.");
      error.statusCode = 404;
      throw error;
    }
    res.json({ success: true, message: "Expense deleted successfully." });
  } catch (error) {
    next(error);
  }
};
