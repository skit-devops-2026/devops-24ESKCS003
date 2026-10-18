const express = require("express");
const router = express.Router();
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const nodemailer = require("nodemailer");
const User = require("../models/User");

// Configure Nodemailer transporter for Render
const transporter = nodemailer.createTransport({
  host: "smtp.gmail.com",
  port: 587,
  secure: false, // Must be false for port 587
  requireTLS: true, // Forces TLS encryption
  family: 4, // NEW: Forces IPv4 routing to bypass Render's IPv6 limits
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

// Helper: Generate random 6-digit OTP
const generateOTP = () =>
  Math.floor(100000 + Math.random() * 900000).toString();

// 1. Send OTP for Registration
router.post("/send-register-otp", async (req, res) => {
  try {
    const { email } = req.body;
    const existingUser = await User.findOne({ email, isVerified: true });
    if (existingUser) {
      return res
        .status(400)
        .json({ error: "Email is already registered. Please log in." });
    }

    const otp = generateOTP();
    const otpExpiry = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes validity

    // Upsert temporary unverified user
    await User.findOneAndUpdate(
      { email },
      { otp, otpExpiry, isVerified: false },
      { upsert: true, new: true },
    );

    await transporter.sendMail({
      from: process.env.EMAIL_USER,
      to: email,
      subject: "Your Registration OTP - Loan Approval System",
      text: `Your 6-digit verification code is: ${otp}. It expires in 10 minutes.`,
    });

    res.json({ message: "OTP sent successfully to your email." });
  } catch (err) {
    res.status(500).json({ error: "Failed to send OTP: " + err.message });
  }
});

// 2. Verify OTP and Complete Registration
router.post("/complete-registration", async (req, res) => {
  try {
    const { email, otp, name, mobileNumber, password } = req.body;

    const user = await User.findOne({ email });
    if (!user || user.otp !== otp || user.otpExpiry < new Date()) {
      return res.status(400).json({ error: "Invalid or expired OTP." });
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    user.name = name;
    user.mobileNumber = mobileNumber;
    user.password = hashedPassword;
    user.isVerified = true;
    user.otp = undefined;
    user.otpExpiry = undefined;
    await user.save();

    // NEW LOGIC: Generate the login token right now!
    const token = jwt.sign(
      { userId: user._id, email: user.email },
      process.env.JWT_SECRET,
      { expiresIn: "7d" },
    );

    // Send the token and user data back so React can log them in instantly
    res.json({
      message: "Account registered successfully!",
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        mobileNumber: user.mobileNumber,
      },
    });
  } catch (err) {
    res.status(500).json({ error: "Registration failed: " + err.message });
  }
});

// 3. User Login
router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email, isVerified: true });
    if (!user) {
      return res
        .status(400)
        .json({ error: "Invalid email or account does not exist." });
    }

    // NEW LOGIC: Catch Google users who haven't set a password yet
    if (!user.password) {
      return res.status(400).json({
        error:
          "This account was created with Google. Please click 'Continue with Google' to log in, or use 'Forgot Password' to set a password for this form.",
      });
    }

    // This will now only run if user.password actually exists
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ error: "Invalid credentials." });
    }

    const token = jwt.sign(
      { userId: user._id, email: user.email },
      process.env.JWT_SECRET,
      { expiresIn: "7d" },
    );

    res.json({
      token,
      user: { id: user._id, name: user.name, email: user.email },
    });
  } catch (err) {
    res.status(500).json({ error: "Login failed: " + err.message });
  }
});

// POST: Google Login / Register
router.post("/google-login", async (req, res) => {
  try {
    const { token } = req.body;

    // Verify the Google ID token securely using Google's API
    const googleRes = await fetch(
      `https://oauth2.googleapis.com/tokeninfo?id_token=${token}`,
    );
    const googleData = await googleRes.json();

    if (!googleData.email || !googleData.email_verified) {
      return res.status(400).json({ error: "Invalid Google token." });
    }

    const { email, name, sub: googleId } = googleData;

    // Check if user already exists in your database
    let user = await User.findOne({ email });

    if (!user) {
      // If they are brand new, create their account automatically
      user = new User({
        name,
        email,
        googleId,
        isVerified: true, // Google accounts are pre-verified
      });
      await user.save();
    } else if (!user.googleId) {
      // If they previously registered with email/password, link their Google ID
      user.googleId = googleId;
      user.isVerified = true;
      await user.save();
    }

    user.decryptFieldsSync();

    // Generate your app's JWT session token
    const jwtToken = jwt.sign(
      { userId: user._id, email: user.email },
      process.env.JWT_SECRET,
      { expiresIn: "7d" },
    );

    res.json({
      token: jwtToken,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        mobileNumber: user.mobileNumber,
      },
    });
  } catch (error) {
    console.error("Google Login Error:", error);
    res.status(500).json({ error: "Google authentication failed." });
  }
});

// 4. Send OTP for Forgot Password
router.post("/forgot-password", async (req, res) => {
  try {
    const { email } = req.body;
    const user = await User.findOne({ email });

    if (!user) {
      return res
        .status(404)
        .json({ error: "User with this email does not exist." });
    }

    // Generate a 6-digit OTP
    const otp = generateOTP();

    // Save the OTP temporarily in the user's database record (valid for 15 minutes)
    user.resetOtp = otp;
    user.resetOtpExpiry = Date.now() + 15 * 60 * 1000;
    await user.save();

    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: email,
      subject: "Password Reset OTP - Loan Approval Predictor",
      text: `Your password reset OTP is: ${otp}. It is valid for 15 minutes.`,
    };

    await transporter.sendMail(mailOptions);
    res.json({ message: "OTP sent successfully!" });
  } catch (error) {
    console.error("Forgot Password Error:", error);
    res.status(500).json({ error: "Failed to send reset OTP." });
  }
});

// 5. Verify OTP and Reset Password
router.post("/reset-password", async (req, res) => {
  try {
    const { email, otp, newPassword } = req.body;
    const user = await User.findOne({ email });

    if (!user) {
      return res.status(404).json({ error: "User not found." });
    }

    console.log("Database OTP:", user.resetOtp);
    console.log("User Entered OTP:", otp);

    if (!user.resetOtp) {
      return res
        .status(400)
        .json({ error: "No OTP found in database. Did User.js save?" });
    }

    // Check if OTP matches (ignoring accidental spaces)
    if (user.resetOtp !== String(otp).trim()) {
      return res.status(400).json({ error: "Incorrect OTP." });
    }

    // Check expiration
    if (user.resetOtpExpiry < Date.now()) {
      return res.status(400).json({ error: "OTP has expired." });
    }

    // Hash the brand new password securely
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(newPassword, salt);

    // Update the database and clear the temporary OTP fields
    user.password = hashedPassword;
    user.resetOtp = undefined;
    user.resetOtpExpiry = undefined;
    await user.save();

    res.json({ message: "Password updated successfully!" });
  } catch (error) {
    console.error("Reset Password Error:", error);
    res.status(500).json({ error: "Failed to reset password." });
  }
});

// 6. Complete Profile (For Google Login users missing a mobile number)
router.post("/complete-profile", async (req, res) => {
  try {
    // 1. Grab the token from the headers
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res
        .status(401)
        .json({ error: "Unauthorized. No token provided." });
    }

    // 2. Decode the token to figure out who this user is
    const token = authHeader.split(" ")[1];
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // 3. Grab the new data sent from React
    const { name, mobileNumber } = req.body;

    // 4. Find the user in MongoDB and update them
    const user = await User.findById(decoded.userId);
    if (!user) {
      return res.status(404).json({ error: "User not found." });
    }

    user.name = name;
    user.mobileNumber = mobileNumber;
    await user.save();

    // 5. Send the updated user back to React
    res.json({
      message: "Profile updated successfully!",
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        mobileNumber: user.mobileNumber,
      },
    });
  } catch (error) {
    console.error("Complete Profile Error:", error);
    if (error.name === "JsonWebTokenError") {
      return res.status(401).json({ error: "Invalid token." });
    }
    res.status(500).json({ error: "Failed to update profile." });
  }
});

module.exports = router;
