import Budget from "../models/Budget.js";
import Expense from "../models/Expense.js";
import Income from "../models/Income.js";

const startOfMonth = (date) => new Date(date.getFullYear(), date.getMonth(), 1);
const endOfMonth = (date) => new Date(date.getFullYear(), date.getMonth() + 1, 0, 23, 59, 59, 999);
const formatCurrency = (value) =>
  new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR", maximumFractionDigits: 0 }).format(Number(value || 0));

export const buildRuleBasedInsights = async (userId) => {
  const now = new Date();
  const currentStart = startOfMonth(now);
  const currentEnd = endOfMonth(now);
  const previousStart = startOfMonth(new Date(now.getFullYear(), now.getMonth() - 1, 1));
  const previousEnd = endOfMonth(new Date(now.getFullYear(), now.getMonth() - 1, 1));

  const [currentExpenses, previousExpenses, budget, incomes] = await Promise.all([
    Expense.find({ user: userId, date: { $gte: currentStart, $lte: currentEnd } }).lean(),
    Expense.find({ user: userId, date: { $gte: previousStart, $lte: previousEnd } }).lean(),
    Budget.findOne({ user: userId }).lean(),
    Income.find({ user: userId, date: { $gte: currentStart, $lte: currentEnd } }).lean()
  ]);

  const currentTotal = currentExpenses.reduce((sum, item) => sum + item.amount, 0);
  const previousTotal = previousExpenses.reduce((sum, item) => sum + item.amount, 0);
  const monthlyIncome = incomes.reduce((sum, item) => sum + item.amount, 0);
  const categoryTotals = currentExpenses.reduce((acc, item) => {
    acc[item.category] = (acc[item.category] || 0) + item.amount;
    return acc;
  }, {});

  const topCategory = Object.entries(categoryTotals).sort((a, b) => b[1] - a[1])[0];
  const percentChange = previousTotal ? ((currentTotal - previousTotal) / previousTotal) * 100 : 0;
  const budgetUsage = budget?.monthlyBudget ? (currentTotal / budget.monthlyBudget) * 100 : 0;
  const savings = monthlyIncome - currentTotal;
  const insights = [];

  if (topCategory) {
    insights.push({
      title: "Highest spending category",
      description: `${topCategory[0]} leads your spending at ${formatCurrency(topCategory[1])} this month.`,
      tone: topCategory[1] > currentTotal * 0.35 ? "warning" : "info"
    });
  }

  if (Math.abs(percentChange) >= 10) {
    insights.push({
      title: "Monthly trend",
      description: `You spent ${Math.abs(percentChange).toFixed(0)}% ${percentChange > 0 ? "more" : "less"} than last month.`,
      tone: percentChange > 0 ? "warning" : "success"
    });
  }

  if (budgetUsage >= (budget?.alertThresholdPercent || 80)) {
    insights.push({
      title: "Budget alert",
      description: `You have used ${budgetUsage.toFixed(0)}% of your monthly budget.`,
      tone: budgetUsage >= 100 ? "danger" : "warning"
    });
  }

  insights.push({
    title: "Savings outlook",
    description: savings >= 0 ? `You are on track to save ${formatCurrency(savings)} this month.` : `You are overspending by ${formatCurrency(Math.abs(savings))} against current income.`,
    tone: savings >= 0 ? "success" : "danger"
  });

  insights.push({
    title: "Smart suggestion",
    description: topCategory ? `Try reducing ${topCategory[0].toLowerCase()} spending by 10% next month to improve your savings rate.` : "Start adding transactions consistently to unlock deeper personalized recommendations.",
    tone: "info"
  });

  return insights;
};
