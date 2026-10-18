import { useState, useEffect } from "react";
import axios from "axios";

const LoanForm = ({ onPredictionComplete, prefillData }) => {
  const [formData, setFormData] = useState({
    loan_amount: "",
    income: "",
    property_value: "",
    debt_to_income_ratio: "<30%",
    loan_term: "360",
    combined_loan_to_value_ratio: "",
    loan_type: "1",
    loan_purpose: "1",
    applicant_age: "25-34",
  });

  // NEW: This hook listens for prefillData coming from the History page
  useEffect(() => {
    if (prefillData) {
      setFormData({
        loan_amount: prefillData.loanAmount || "",
        income: prefillData.income || "",
        property_value: prefillData.propertyValue || "",
        debt_to_income_ratio: prefillData.debtToIncomeRatio || "<30%",
        loan_term: prefillData.loanTerm || "360",
        combined_loan_to_value_ratio:
          prefillData.combinedLoanToValueRatio || "",
        loan_type: prefillData.loanType || "1",
        loan_purpose: prefillData.loanPurpose || "1",
        applicant_age: prefillData.applicantAge || "25-34",
      });
      setResult(null); // Clears the previous result UI
    }
  }, [prefillData]);

  const [showTooltip, setShowTooltip] = useState(false);
  const [result, setResult] = useState(null);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      // 1. Get the REAL prediction from your Python Flask microservice
      const mlResponse = await axios.post(
        "https://loan-ml-service-vnav.onrender.com/predict",
        formData,
      );
      const realPrediction = mlResponse.data.prediction;

      // 2. Update the UI with the real result
      setResult(realPrediction);

      // 3. Save to MongoDB via your Node.js backend route
      const token = localStorage.getItem("token");
      const dbResponse = await axios.post(
        "https://loan-app-backend-0nx9.onrender.com/api/history",
        {
          ...formData,
          prediction: realPrediction, // Sending the real prediction to the database
        },
        {
          headers: { Authorization: `Bearer ${token}` },
        },
      );

      // 4. Send the officially saved database record to the sidebar
      onPredictionComplete(dbResponse.data);
    } catch (error) {
      console.error("Prediction or saving failed:", error);
      alert("Error processing your loan request.");
    }
  };

  const handleReset = () => {
    setFormData({
      loan_amount: "",
      income: "",
      property_value: "",
      debt_to_income_ratio: "<30%",
      loan_term: "360",
      combined_loan_to_value_ratio: "",
      loan_type: "1",
      loan_purpose: "1",
      applicant_age: "25-34",
    });
    setResult(null);
  };

  return (
    <div>
      <form onSubmit={handleSubmit}>
        <fieldset>
          <legend>
            <strong>Financial Details</strong>
          </legend>

          <label>
            <strong>Loan Amount</strong> <i>($)</i>:
          </label>
          <input
            type="number"
            name="loan_amount"
            value={formData.loan_amount}
            onChange={handleChange}
            required
          />
          {formData.loan_amount && (
            <span
              style={{
                display: "block",
                color: "#05c46b",
                fontSize: "12px",
                marginTop: "6px",
              }}
            >
              Requesting: ${formData.loan_amount}
            </span>
          )}

          <label>
            <strong>Annual Income</strong> <i>($)</i>:
          </label>
          <input
            type="number"
            name="income"
            value={formData.income}
            onChange={handleChange}
            required
          />

          <label>
            <strong>Property Value</strong> <i>($)</i>:
          </label>
          <input
            type="number"
            name="property_value"
            value={formData.property_value}
            onChange={handleChange}
            required
          />

          <label>
            <strong>Debt-to-Income Ratio</strong>:
          </label>
          <select
            name="debt_to_income_ratio"
            value={formData.debt_to_income_ratio}
            onChange={handleChange}
          >
            <option value="<30%">Less than 30%</option>
            <option value="30%-<36%">30% - 36%</option>
            <option value="36%-<50%">36% - 50%</option>
            <option value=">50%">&gt; 50%</option>
          </select>
        </fieldset>

        <fieldset>
          <legend>
            <strong>Loan Specifications</strong>
          </legend>

          <label>
            <strong>Loan Term</strong> <i>(Months)</i>:
          </label>
          <select
            name="loan_term"
            value={formData.loan_term}
            onChange={handleChange}
          >
            <option value="120">10 Years</option>
            <option value="240">20 Years</option>
            <option value="360">30 Years</option>
          </select>

          <label>
            <strong>Combined Loan-to-Value Ratio</strong> <i>(e.g., 0.75)</i>:
          </label>
          <input
            type="number"
            step="0.01"
            name="combined_loan_to_value_ratio"
            value={formData.combined_loan_to_value_ratio}
            onChange={handleChange}
            onMouseEnter={() => setShowTooltip(true)}
            onMouseLeave={() => setShowTooltip(false)}
            required
          />
          {showTooltip && (
            <span
              style={{
                display: "block",
                color: "#ffda79",
                fontSize: "12px",
                marginTop: "6px",
              }}
            >
              Value must be a decimal like 0.75
            </span>
          )}

          <label>
            <strong>Loan Type</strong>:
          </label>
          <div
            className="radio-group"
            style={{ marginTop: "10px", fontSize: "14px" }}
          >
            <input
              type="radio"
              name="loan_type"
              value="1"
              checked={formData.loan_type === "1"}
              onChange={handleChange}
              style={{ marginLeft: 0, marginRight: "5px" }}
            />{" "}
            Conventional
            <input
              type="radio"
              name="loan_type"
              value="2"
              checked={formData.loan_type === "2"}
              onChange={handleChange}
              style={{ marginLeft: "10px", marginRight: "5px" }}
            />{" "}
            FHA
            <input
              type="radio"
              name="loan_type"
              value="3"
              checked={formData.loan_type === "3"}
              onChange={handleChange}
              style={{ marginLeft: "10px", marginRight: "5px" }}
            />{" "}
            VA
          </div>

          <label>
            <strong>Loan Purpose</strong>:
          </label>
          <select
            name="loan_purpose"
            value={formData.loan_purpose}
            onChange={handleChange}
          >
            <option value="1">Home Purchase</option>
            <option value="2">Refinance</option>
            <option value="3">Home Improvement</option>
          </select>

          <label>
            <strong>Applicant Age</strong>:
          </label>
          <select
            name="applicant_age"
            value={formData.applicant_age}
            onChange={handleChange}
          >
            <option value="25-34">25-34</option>
            <option value="35-44">35-44</option>
            <option value="45-54">45-54</option>
            <option value="55-64">55-64</option>
            <option value=">64">&gt; 64</option>
          </select>
        </fieldset>

        <button type="submit" id="submitBtn">
          Check Loan Status
        </button>
      </form>

      {result && (
        <div
          style={{
            marginTop: "20px",
            padding: "15px",
            textAlign: "center",
            fontWeight: "bold",
            fontSize: "18px",
            borderRadius: "6px",
            backgroundColor: result === "Approved" ? "#05c46b" : "#ff3f34",
            color: "#1e272e",
            border: `2px solid ${result === "Approved" ? "#05c46b" : "#ff3f34"}`,
          }}
        >
          <div>
            Status: {result === "Approved" ? "APPROVED ✅" : "DENIED ❌"}
          </div>

          <button
            type="button"
            onClick={handleReset}
            style={{
              marginTop: "15px",
              padding: "8px 16px",
              fontSize: "14px",
              fontWeight: "bold",
              cursor: "pointer",
              borderRadius: "4px",
              border: "none",
              backgroundColor: "#1e272e",
              color: result === "Approved" ? "#05c46b" : "#ff3f34",
            }}
          >
            Make Another Prediction
          </button>
        </div>
      )}
    </div>
  );
};

export default LoanForm;
