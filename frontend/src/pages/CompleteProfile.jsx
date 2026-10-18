import { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import axios from "axios";

const CompleteProfile = () => {
  const [name, setName] = useState("");
  const [mobileNumber, setMobileNumber] = useState("");

  const location = useLocation();
  const navigate = useNavigate();

  // Grab the Google name passed from the Login page traffic cop
  useEffect(() => {
    if (location.state?.prefillName) {
      setName(location.state.prefillName);
    }
  }, [location]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem("token");

      // Send the missing data to the backend to update the user
      const response = await axios.post(
        "https://loan-app-backend-0nx9.onrender.com/api/auth/complete-profile",
        { name, mobileNumber },
        { headers: { Authorization: `Bearer ${token}` } },
      );

      // Update the local user storage and send them to the dashboard!
      localStorage.setItem("user", JSON.stringify(response.data.user));
      alert("Profile completed successfully!");
      navigate("/history");
    } catch (error) {
      console.error("Failed to complete profile:", error);
      alert(
        error.response?.data?.error ||
          "Failed to update profile. Please try again.",
      );
    }
  };

  return (
    <div className="form-container" style={{ marginTop: "50px" }}>
      <h2>
        <strong>
          <u>Complete Profile</u>
        </strong>
      </h2>

      <div
        style={{ textAlign: "center", marginBottom: "20px", color: "#7f8fa6" }}
      >
        Welcome! Just one last step before we set up your dashboard.
      </div>

      <form onSubmit={handleSubmit}>
        <label>
          <strong>Full Name:</strong>
        </label>
        <input
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          required
          placeholder="Enter your full name"
        />

        <label>
          <strong>Mobile Number:</strong>
        </label>
        {/* Changed type from "tel" to "text" so your CSS catches it */}
        <input
          type="text"
          value={mobileNumber}
          onChange={(e) => setMobileNumber(e.target.value)}
          required
          placeholder="e.g. +91 9876543210"
        />

        {/* Added explicit padding and font sizing to match your main theme */}
        <button
          type="submit"
          id="submitBtn"
          style={{
            marginTop: "20px",
            width: "100%",
            padding: "12px",
            fontSize: "16px",
            fontWeight: "bold",
          }}
        >
          Save & Continue
        </button>
      </form>
    </div>
  );
};

export default CompleteProfile;
