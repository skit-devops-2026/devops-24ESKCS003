import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import axios from "axios";

const Register = () => {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    mobileNumber: "",
    password: "",
  });
  const [otp, setOtp] = useState("");
  const [step, setStep] = useState(1); // Step 1: Details, Step 2: OTP
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSendOTP = async (e) => {
    e.preventDefault();
    try {
      await axios.post("http://localhost:5000/api/auth/send-register-otp", {
        email: formData.email,
      });
      alert("OTP sent to your email!");
      setStep(2);
    } catch (error) {
      alert(error.response?.data?.error || "Failed to send OTP.");
    }
  };

  const handleVerifyOTP = async (e) => {
    e.preventDefault();
    try {
      const response = await axios.post(
        "http://localhost:5000/api/auth/complete-registration",
        {
          ...formData,
          otp,
        },
      );

      // NEW LOGIC: Save the token and user data directly to local storage
      localStorage.setItem("token", response.data.token);
      localStorage.setItem("user", JSON.stringify(response.data.user));

      alert("Registration successful! Welcome aboard.");

      // Teleport them straight to the dashboard!
      navigate("/history");
    } catch (error) {
      alert(error.response?.data?.error || "Invalid or expired OTP.");
    }
  };

  return (
    <div className="form-container" style={{ marginTop: "50px" }}>
      <h2>
        <strong>
          <u>Create Account</u>
        </strong>
      </h2>

      {step === 1 ? (
        <form onSubmit={handleSendOTP}>
          <label>
            <strong>Full Name:</strong>
          </label>
          <input type="text" name="name" onChange={handleChange} required />

          <label>
            <strong>Email Address:</strong>
          </label>
          <input type="email" name="email" onChange={handleChange} required />

          <label>
            <strong>Mobile Number:</strong>
          </label>
          <input
            type="text"
            name="mobileNumber"
            onChange={handleChange}
            required
          />

          <label>
            <strong>Password:</strong>
          </label>
          <input
            type="password"
            name="password"
            onChange={handleChange}
            required
          />

          <button type="submit" id="submitBtn">
            Send OTP
          </button>
        </form>
      ) : (
        <form onSubmit={handleVerifyOTP}>
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
          <button type="submit" id="submitBtn">
            Verify & Register
          </button>
        </form>
      )}

      <div style={{ marginTop: "20px", textAlign: "center", fontSize: "14px" }}>
        <p>
          Already have an account?{" "}
          <Link to="/login" style={{ color: "#0fbcf9" }}>
            Login Here
          </Link>
        </p>
      </div>
    </div>
  );
};

export default Register;
