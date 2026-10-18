import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import axios from "axios";
import { GoogleLogin } from "@react-oauth/google";

const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    try {
      const response = await axios.post(
        "https://loan-app-backend-0nx9.onrender.com/api/auth/login",
        {
          email,
          password,
        },
      );

      // Save the secure JWT token to the browser
      localStorage.setItem("token", response.data.token);
      alert("Login successful!");

      // Redirect to the upcoming prediction history page
      navigate("/history");
    } catch (error) {
      alert(error.response?.data?.error || "Login failed. Please try again.");
    }
  };

  return (
    <div className="auth-wrapper">
      <div className="form-container auth-card">
        <h2>
          <strong>
            <u>Login</u>
          </strong>
        </h2>

        <form onSubmit={handleLogin}>
          <label>
            <strong>Email Address:</strong>
          </label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />

          <label>
            <strong>Password:</strong>
          </label>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />

          <button type="submit" id="submitBtn">
            Login
          </button>
        </form>

        <div
          style={{
            display: "flex",
            justifyContent: "center",
            marginTop: "15px",
          }}
        >
          <GoogleLogin
            onSuccess={async (credentialResponse) => {
              try {
                const res = await axios.post(
                  "https://loan-app-backend-0nx9.onrender.com/api/auth/google-login",
                  {
                    token: credentialResponse.credential,
                  },
                );

                localStorage.setItem("token", res.data.token);
                localStorage.setItem("user", JSON.stringify(res.data.user));

                // NEW ROUTING LOGIC: Check for mobile number
                if (!res.data.user.mobileNumber) {
                  // Route to the new profile completion page and pass their Google name
                  navigate("/complete-profile", {
                    state: { prefillName: res.data.user.name },
                  });
                } else {
                  // Existing user, send directly to dashboard
                  navigate("/history");
                }
              } catch (error) {
                console.error("Google login backend error:", error);
                alert(error.response?.data?.error || "Google login failed.");
              }
            }}
            onError={() => {
              console.error("Google Login Failed");
            }}
          />
        </div>

        <div
          style={{ marginTop: "20px", textAlign: "center", fontSize: "14px" }}
        >
          <Link
            to="/forgot-password"
            style={{ color: "#ffda79", textDecoration: "none" }}
          >
            Forgot Password?
          </Link>
          <p style={{ marginTop: "15px" }}>
            Don't have an account?{" "}
            <Link to="/register" style={{ color: "#0fbcf9" }}>
              Register Here
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Login;
