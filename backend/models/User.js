const mongoose = require("mongoose");
const mongooseFieldEncryption =
  require("mongoose-field-encryption").fieldEncryption;

const UserSchema = new mongoose.Schema({
  // Basic Details
  name: { type: String },
  email: { type: String, required: true, unique: true },
  mobileNumber: { type: String },
  password: { type: String }, // Will be empty if they use Google Login

  // Google Login Field
  googleId: { type: String },

  // OTP Verification Fields
  otp: { type: String },
  otpExpiry: { type: Date },
  isVerified: { type: Boolean, default: false },

  resetOtp: { type: String },
  resetOtpExpiry: { type: Date },

  createdAt: { type: Date, default: Date.now },
});

// ENCRYPTION PLUGIN
UserSchema.plugin(mongooseFieldEncryption, {
  fields: ["mobileNumber", "name"],
  secret: process.env.ENCRYPTION_KEY,
});

module.exports = mongoose.model("User", UserSchema);
