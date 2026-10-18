const express = require("express");
const router = express.Router();
const History = require("../models/History");
const fetchUser = require("../middleware/fetchUser");

// GET: Fetch all past predictions for the logged-in user
router.get("/", fetchUser, async (req, res) => {
  try {
    // Use the exact same aggressive ID extraction as the POST route
    const extractedId =
      req.user.userId ||
      req.user.id ||
      req.user._id ||
      (req.user.user && req.user.user.id);

    if (!extractedId) {
      return res.status(400).json({ error: "Missing User ID in token" });
    }

    const history = await History.find({ userId: extractedId }).sort({
      date: -1,
    });

    // NEW LOGIC: Decrypt every document before sending it to the frontend
    history.forEach((doc) => doc.decryptFieldsSync());

    res.json(history);
  } catch (error) {
    console.error("Fetch History Error:", error.message);
    res.status(500).json({ error: "Server Error" });
  }
});

// POST: Save a brand new prediction
router.post("/", fetchUser, async (req, res) => {
  try {
    // Identical ID extraction
    const extractedId =
      req.user.userId ||
      req.user.id ||
      req.user._id ||
      (req.user.user && req.user.user.id);

    if (!extractedId) {
      return res.status(400).json({ error: "Missing User ID in token" });
    }

    // Map the snake_case React data to your camelCase MongoDB schema
    const newRecord = new History({
      userId: extractedId,
      loanAmount: req.body.loan_amount,
      income: req.body.income,
      propertyValue: req.body.property_value,
      debtToIncomeRatio: req.body.debt_to_income_ratio,
      loanTerm: req.body.loan_term,
      combinedLoanToValueRatio: req.body.combined_loan_to_value_ratio,
      loanType: req.body.loan_type,
      loanPurpose: req.body.loan_purpose,
      applicantAge: req.body.applicant_age,
      predictionResult: req.body.prediction,
    });

    const savedRecord = await newRecord.save();

    // Decrypt the newly saved record in memory before returning it
    savedRecord.decryptFieldsSync();

    res.json(savedRecord);
  } catch (error) {
    console.error("Save History Error:", error.message);
    res.status(500).json({ error: "Server Error" });
  }
});

module.exports = router;
