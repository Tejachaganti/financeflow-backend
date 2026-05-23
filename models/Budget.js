import mongoose from "mongoose";

const budgetSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true, unique: true },
    monthlyBudget: { type: Number, default: 0 },
    categoryLimits: {
      Food: { type: Number, default: 0 },
      Travel: { type: Number, default: 0 },
      Shopping: { type: Number, default: 0 },
      Bills: { type: Number, default: 0 },
      Education: { type: Number, default: 0 },
      Entertainment: { type: Number, default: 0 },
      Healthcare: { type: Number, default: 0 },
      Others: { type: Number, default: 0 }
    },
    alertThresholdPercent: { type: Number, default: 80 }
  },
  { timestamps: true }
);

export default mongoose.model("Budget", budgetSchema);
