const mongoose = require("mongoose");
const mongooseFieldEncryption =
  require("mongoose-field-encryption").fieldEncryption;

const HistorySchema = new mongoose.Schema({
  // Link to the user who made the prediction
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },

  // Financial Details (These will be encrypted)
  loanAmount: { type: Number, required: true },
  income: { type: Number, required: true },
  propertyValue: { type: Number, required: true },
  debtToIncomeRatio: { type: String, required: true }, // e.g., "<30%", "36%-<50%"

  // Loan Specifications
  loanTerm: { type: Number, required: true }, // 120, 240, or 360
  combinedLoanToValueRatio: { type: Number, required: true }, // e.g., 0.75
  loanType: { type: String, required: true }, // "1", "2", or "3"
  loanPurpose: { type: String, required: true }, // "1", "2", or "3"
  applicantAge: { type: String, required: true }, // e.g., "25-34"

  // The final result returned by your Flask ML model
  predictionResult: { type: String, required: true }, // "Approved" or "Denied"

  // Timestamp of when the prediction was made
  date: { type: Date, default: Date.now },
});

// ENCRYPTION PLUGIN
HistorySchema.plugin(mongooseFieldEncryption, {
  fields: [
    "loanAmount",
    "income",
    "propertyValue",
    "debtToIncomeRatio",
    "combinedLoanToValueRatio", // Added this field
  ],
  secret: process.env.ENCRYPTION_KEY,
});

module.exports = mongoose.model("History", HistorySchema);
