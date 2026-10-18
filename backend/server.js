const express = require("express");
const cors = require("cors");
const mongoose = require("mongoose"); // Import Mongoose
require("dotenv").config();
const authRoutes = require("./routes/auth");
const historyRoutes = require("./routes/history");

const app = express();

app.use(cors());
app.use(express.json());
app.use("/api/history", historyRoutes);

// Connect to MongoDB
mongoose
  .connect(process.env.MONGO_URI)
  .then(() => console.log("Successfully connected to MongoDB Atlas!"))
  .catch((error) => console.error("MongoDB connection failed:", error.message));

app.use("/api/auth", authRoutes);
app.get("/api/test", (req, res) => {
  res.json({
    message: "Jarvis is online: Node.js Backend is running smoothly!",
  });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server is running on port: ${PORT}`);
});
