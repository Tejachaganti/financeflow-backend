import mongoose from "mongoose";

const expenseSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    title: { type: String, required: true, trim: true },
    amount: { type: Number, required: true, min: 0 },
    category: {
      type: String,
      enum: ["Food", "Travel", "Shopping", "Bills", "Education", "Entertainment", "Healthcare", "Others"],
      default: "Others"
    },
    date: { type: Date, required: true },
    paymentMethod: {
      type: String,
      enum: ["Cash", "Credit Card", "Debit Card", "UPI", "Bank Transfer", "Wallet"],
      default: "UPI"
    },
    notes: { type: String, default: "" },
    receiptUrl: { type: String, default: "" },
    recurring: { type: Boolean, default: false },
    recurringFrequency: { type: String, enum: ["none", "daily", "weekly", "monthly"], default: "none" }
  },
  { timestamps: true }
);

expenseSchema.index({ user: 1, date: -1 });
expenseSchema.index({ user: 1, category: 1 });

export default mongoose.model("Expense", expenseSchema);
