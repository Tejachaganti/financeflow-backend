import mongoose from "mongoose";

const incomeSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    source: { type: String, required: true, trim: true },
    amount: { type: Number, required: true, min: 0 },
    date: { type: Date, required: true },
    recurring: { type: Boolean, default: false },
    notes: { type: String, default: "" }
  },
  { timestamps: true }
);

incomeSchema.index({ user: 1, date: -1 });

export default mongoose.model("Income", incomeSchema);
