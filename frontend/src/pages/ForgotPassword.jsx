import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import axios from "axios";

const ForgotPassword = () => {
  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [step, setStep] = useState(1); // Step 1: Email, Step 2: OTP & New Password
  const navigate = useNavigate();

  const handleSendOTP = async (e) => {
    e.preventDefault();
    try {
      // Adjust this URL if your backend route is named differently
      await axios.post(
        "https://loan-app-backend-0nx9.onrender.com/api/auth/forgot-password",
        {
          email,
        },
      );
      alert("Password reset OTP sent to your email!");
      setStep(2);
    } catch (error) {
      alert(error.response?.data?.error || "Failed to send reset OTP.");
    }
  };

  const handleResetPassword = async (e) => {
    e.preventDefault();
    try {
      // Adjust this URL if your backend route is named differently
      await axios.post(
        "https://loan-app-backend-0nx9.onrender.com/api/auth/reset-password",
        {
          email,
          otp,
          newPassword,
        },
      );
      alert("Password reset successfully! Please log in.");
      navigate("/login");
    } catch (error) {
      alert(
        error.response?.data?.error ||
          "Invalid OTP or error resetting password.",
      );
    }
  };

  return (
    <div className="form-container" style={{ marginTop: "50px" }}>
      <h2>
        <strong>
          <u>Reset Password</u>
        </strong>
      </h2>

      {step === 1 ? (
        <form onSubmit={handleSendOTP}>
          <label>
            <strong>Registered Email Address:</strong>
          </label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
          <button type="submit" id="submitBtn">
            Send Reset OTP
          </button>
        </form>
      ) : (
        <form onSubmit={handleResetPassword}>
          <label>
            <strong>Enter 6-Digit OTP:</strong>
          </label>
          <input
            type="text"
            value={otp}
            onChange={(e) => setOtp(e.target.value)}
            required
            maxLength="6"
          />

          <label>
            <strong>New Password:</strong>
          </label>
          <input
            type="password"
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
            required
          />
          <button type="submit" id="submitBtn">
            Update Password
          </button>
        </form>
      )}

      <div style={{ marginTop: "20px", textAlign: "center", fontSize: "14px" }}>
        <p>
          Remember your password?{" "}
          <Link to="/login" style={{ color: "#0fbcf9" }}>
            Login Here
          </Link>
        </p>
      </div>
    </div>
  );
};

export default ForgotPassword;
