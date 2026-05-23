export const buildExpenseFilters = (query, userId) => {
  const filters = { user: userId };

  if (query.search) {
    filters.title = { $regex: query.search, $options: "i" };
  }

  if (query.category && query.category !== "All") {
    filters.category = query.category;
  }

  if (query.startDate || query.endDate) {
    filters.date = {};
    if (query.startDate) {
      filters.date.$gte = new Date(query.startDate);
    }
    if (query.endDate) {
      filters.date.$lte = new Date(query.endDate);
    }
  }

  if (query.month) {
    const year = Number(query.year || new Date().getFullYear());
    const month = Number(query.month) - 1;
    const start = new Date(year, month, 1);
    const end = new Date(year, month + 1, 0, 23, 59, 59, 999);
    filters.date = { ...(filters.date || {}), $gte: start, $lte: end };
  }

  return filters;
};

export const getSortOption = (sortBy = "date", order = "desc") => {
  const direction = order === "asc" ? 1 : -1;
  if (sortBy === "amount") {
    return { amount: direction };
  }
  return { date: direction };
};
