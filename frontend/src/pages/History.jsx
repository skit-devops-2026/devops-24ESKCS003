import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import LoanForm from "./LoanForm";

const History = () => {
  const navigate = useNavigate();
  const [predictions, setPredictions] = useState([]);
  const [selectedPrediction, setSelectedPrediction] = useState(null);

  // 1. Pagination State
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  // 2. Copy to Form State
  const [prefillData, setPrefillData] = useState(null);

  useEffect(() => {
    const fetchHistory = async () => {
      const token = localStorage.getItem("token");
      if (!token) {
        navigate("/login");
        return;
      }

      try {
        const response = await axios.get(
          "https://loan-app-backend-0nx9.onrender.com/api/history",
          {
            headers: { Authorization: `Bearer ${token}` },
          },
        );
        setPredictions(response.data);
      } catch (error) {
        console.error("Failed to fetch history:", error);
        if (error.response?.status === 401) {
          localStorage.removeItem("token");
          navigate("/login");
        }
      }
    };

    fetchHistory();
  }, [navigate]);

  const handleLogout = () => {
    localStorage.removeItem("token");
    navigate("/login");
  };

  const handleNewPrediction = (newRecord) => {
    setPredictions([newRecord, ...predictions]);
    setCurrentPage(1); // Snap back to page 1 to see the new prediction
    setPrefillData(null); // Clear prefill data
  };

  // Pagination Math
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentHistoryItems = predictions.slice(
    indexOfFirstItem,
    indexOfLastItem,
  );
  const totalPages = Math.ceil(predictions.length / itemsPerPage);

  const goToNextPage = () =>
    setCurrentPage((prev) => Math.min(prev + 1, totalPages));
  const goToPrevPage = () => setCurrentPage((prev) => Math.max(prev - 1, 1));

  const handleCopyToForm = () => {
    setPrefillData(selectedPrediction); // Save the data to pass to the form
    setSelectedPrediction(null); // Close the detail view to reveal the form
  };

  return (
    <div
      style={{
        display: "flex",
        gap: "20px",
        maxWidth: "1000px",
        margin: "0 auto",
        alignItems: "flex-start",
      }}
    >
      <div
        className="form-container"
        style={{ flex: "1", marginTop: "50px", padding: "20px" }}
      >
        <h2>
          <strong>
            <u>History</u>
          </strong>
        </h2>

        {predictions.length === 0 ? (
          <div
            style={{ textAlign: "center", color: "#7f8fa6", margin: "30px 0" }}
          >
            No predictions yet.
          </div>
        ) : (
          <>
            <ul style={{ listStyleType: "none", padding: 0 }}>
              {currentHistoryItems.map((pred, index) => (
                <li
                  key={index}
                  onClick={() => setSelectedPrediction(pred)}
                  style={{
                    backgroundColor:
                      selectedPrediction === pred ? "#2f3640" : "#1e272e",
                    padding: "10px",
                    marginBottom: "10px",
                    borderRadius: "6px",
                    borderLeft: `5px solid ${
                      pred.predictionResult === "Approved"
                        ? "#05c46b"
                        : "#ff3f34"
                    }`,
                    cursor: "pointer",
                    transition: "background-color 0.2s",
                  }}
                >
                  <strong>${pred.loanAmount}</strong> - {pred.predictionResult}
                  <div
                    style={{
                      fontSize: "12px",
                      color: "#7f8fa6",
                      marginTop: "4px",
                    }}
                  >
                    {new Date(pred.date).toLocaleDateString()}
                  </div>
                </li>
              ))}
            </ul>

            {/* Pagination Controls */}
            {totalPages > 1 && (
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  marginTop: "15px",
                  gap: "10px", // Adds a little breathing room
                }}
              >
                <button
                  onClick={goToPrevPage}
                  disabled={currentPage === 1}
                  style={{
                    padding: "6px 12px",
                    fontSize: "12px",
                    cursor: currentPage === 1 ? "not-allowed" : "pointer",
                    opacity: currentPage === 1 ? 0.5 : 1,
                  }}
                >
                  ◀ Prev
                </button>

                {/* Added whiteSpace: "nowrap" to prevent stacking */}
                <span
                  style={{
                    fontSize: "14px",
                    fontWeight: "bold",
                    whiteSpace: "nowrap",
                  }}
                >
                  Page {currentPage} of {totalPages}
                </span>

                <button
                  onClick={goToNextPage}
                  disabled={currentPage === totalPages}
                  style={{
                    padding: "6px 12px",
                    fontSize: "12px",
                    cursor:
                      currentPage === totalPages ? "not-allowed" : "pointer",
                    opacity: currentPage === totalPages ? 0.5 : 1,
                  }}
                >
                  Next ▶
                </button>
              </div>
            )}
          </>
        )}

        <button
          onClick={handleLogout}
          style={{
            backgroundColor: "#ff4757",
            padding: "10px",
            marginTop: "30px",
            width: "100%",
          }}
        >
          Logout
        </button>
      </div>

      <div className="form-container" style={{ flex: "2", marginTop: "50px" }}>
        {selectedPrediction ? (
          <div>
            <h2>
              <strong>
                <u>Prediction Details</u>
              </strong>
            </h2>
            <div
              style={{
                backgroundColor: "#1e272e",
                padding: "20px",
                borderRadius: "6px",
                marginBottom: "20px",
                fontSize: "15px",
                lineHeight: "1.6",
              }}
            >
              <p>
                <strong>Status:</strong>{" "}
                <span
                  style={{
                    color:
                      selectedPrediction.predictionResult === "Approved"
                        ? "#05c46b"
                        : "#ff3f34",
                    fontWeight: "bold",
                  }}
                >
                  {selectedPrediction.predictionResult}
                </span>
              </p>
              <p>
                <strong>Date:</strong>{" "}
                {new Date(selectedPrediction.date).toLocaleString()}
              </p>
              <hr style={{ borderColor: "#485460", margin: "15px 0" }} />
              <p>
                <strong>Loan Amount:</strong> ${selectedPrediction.loanAmount}
              </p>
              <p>
                <strong>Annual Income:</strong> ${selectedPrediction.income}
              </p>
              <p>
                <strong>Property Value:</strong> $
                {selectedPrediction.propertyValue}
              </p>
              <p>
                <strong>Debt-to-Income Ratio:</strong>{" "}
                {selectedPrediction.debtToIncomeRatio}
              </p>
              <p>
                <strong>Loan Term:</strong> {selectedPrediction.loanTerm} months
              </p>
              <p>
                <strong>Combined LTV Ratio:</strong>{" "}
                {selectedPrediction.combinedLoanToValueRatio}
              </p>
              <p>
                <strong>Loan Type:</strong>{" "}
                {selectedPrediction.loanType === "1"
                  ? "Conventional"
                  : selectedPrediction.loanType === "2"
                    ? "FHA"
                    : "VA"}
              </p>
              <p>
                <strong>Loan Purpose:</strong>{" "}
                {selectedPrediction.loanPurpose === "1"
                  ? "Home Purchase"
                  : selectedPrediction.loanPurpose === "2"
                    ? "Refinance"
                    : "Home Improvement"}
              </p>
              <p>
                <strong>Applicant Age:</strong>{" "}
                {selectedPrediction.applicantAge}
              </p>
            </div>

            <div style={{ display: "flex", gap: "10px" }}>
              <button
                onClick={handleCopyToForm}
                style={{
                  flex: 1,
                  backgroundColor: "#2ed573",
                  padding: "10px",
                  fontSize: "16px",
                  color: "#1e272e",
                  fontWeight: "bold",
                }}
              >
                Copy to Form 📋
              </button>

              <button
                onClick={() => setSelectedPrediction(null)}
                style={{
                  flex: 1,
                  backgroundColor: "#0fbcf9",
                  padding: "10px",
                  fontSize: "16px",
                  color: "#1e272e",
                  fontWeight: "bold",
                }}
              >
                Back to Blank Form
              </button>
            </div>
          </div>
        ) : (
          <div>
            <h2>
              <strong>
                <u>New Prediction</u>
              </strong>
            </h2>
            {/* 3. Pass the prefillData into the form */}
            <LoanForm
              onPredictionComplete={handleNewPrediction}
              prefillData={prefillData}
            />
          </div>
        )}
      </div>
    </div>
  );
};

export default History;
