import { stringify } from "csv-stringify/sync";
import PDFDocument from "pdfkit";
import Expense from "../models/Expense.js";
import Income from "../models/Income.js";
import Budget from "../models/Budget.js";
import { buildRuleBasedInsights } from "../utils/insightEngine.js";

const currentYear = new Date().getFullYear();
const formatCurrency = (value) =>
  new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR", maximumFractionDigits: 0 }).format(Number(value || 0));

export const getAnalytics = async (req, res, next) => {
  try {
    const expenses = await Expense.find({ user: req.user._id }).sort({ date: 1 }).lean();
    const incomes = await Income.find({ user: req.user._id }).sort({ date: 1 }).lean();
    const budget = await Budget.findOne({ user: req.user._id }).lean();

    const categoryData = Object.entries(
      expenses.reduce((acc, item) => {
        acc[item.category] = (acc[item.category] || 0) + item.amount;
        return acc;
      }, {})
    ).map(([name, value]) => ({ name, value }));

    const monthlyMap = new Map();
    const weeklyMap = new Map();
    expenses.forEach((item) => {
      const date = new Date(item.date);
      const monthKey = date.toLocaleString("en-US", { month: "short" });
      const weekKey = `W${Math.ceil(date.getDate() / 7)}`;
      monthlyMap.set(monthKey, (monthlyMap.get(monthKey) || 0) + item.amount);
      weeklyMap.set(weekKey, (weeklyMap.get(weekKey) || 0) + item.amount);
    });

    const monthlyExpenses = Array.from(monthlyMap.entries()).map(([label, total]) => ({ label, total }));
    const weeklySpending = Array.from(weeklyMap.entries()).map(([label, total]) => ({ label, total }));
    const totalExpenses = expenses.reduce((sum, item) => sum + item.amount, 0);
    const totalIncome = incomes.reduce((sum, item) => sum + item.amount, 0);
    const currentMonthLabel = new Date().toLocaleString("en-US", { month: "short" });
    const currentMonthActual = monthlyExpenses.find((item) => item.label === currentMonthLabel)?.total || 0;

    res.json({
      success: true,
      analytics: {
        totals: {
          totalExpenses,
          totalIncome,
          savings: totalIncome - totalExpenses,
          monthlyBudget: budget?.monthlyBudget || 0
        },
        categoryData,
        monthlyExpenses,
        weeklySpending,
        budgetVsActual: [
          { label: "Budget", value: budget?.monthlyBudget || 0 },
          { label: "Actual", value: currentMonthActual }
        ],
        year: currentYear
      }
    });
  } catch (error) {
    next(error);
  }
};

export const getInsights = async (req, res, next) => {
  try {
    const insights = await buildRuleBasedInsights(req.user._id);
    res.json({ success: true, insights });
  } catch (error) {
    next(error);
  }
};

export const exportExpensesCsv = async (req, res, next) => {
  try {
    const expenses = await Expense.find({ user: req.user._id }).sort({ date: -1 }).lean();
    const rows = expenses.map((item) => ({
      title: item.title,
      amount: item.amount,
      category: item.category,
      date: new Date(item.date).toISOString().slice(0, 10),
      paymentMethod: item.paymentMethod,
      notes: item.notes
    }));

    const csv = stringify(rows, { header: true });
    res.setHeader("Content-Type", "text/csv");
    res.setHeader("Content-Disposition", "attachment; filename=expenses-report.csv");
    res.send(csv);
  } catch (error) {
    next(error);
  }
};

export const exportExpensesPdf = async (req, res, next) => {
  try {
    const expenses = await Expense.find({ user: req.user._id }).sort({ date: -1 }).lean();
    const insights = await buildRuleBasedInsights(req.user._id);
    const doc = new PDFDocument({ margin: 40 });

    res.setHeader("Content-Type", "application/pdf");
    res.setHeader("Content-Disposition", "attachment; filename=finance-report.pdf");
    doc.pipe(res);

    doc.fontSize(22).text("FinanceFlow Monthly Report");
    doc.moveDown();
    doc.fontSize(12).text(`Generated on: ${new Date().toLocaleDateString()}`);
    doc.moveDown();

    expenses.slice(0, 12).forEach((item) => {
      doc.text(`${item.title} | ${item.category} | ${formatCurrency(item.amount)} | ${new Date(item.date).toLocaleDateString("en-IN")}`);
    });

    doc.moveDown().fontSize(16).text("AI Insights");
    insights.forEach((item) => {
      doc.fontSize(12).text(`- ${item.title}: ${item.description}`);
    });

    doc.end();
  } catch (error) {
    next(error);
  }
};
