const jwt = require("jsonwebtoken");

const fetchUser = (req, res, next) => {
  // Look for the token in the request headers
  const authHeader = req.header("Authorization");
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return res
      .status(401)
      .json({ error: "Access denied. No valid token provided." });
  }

  // Extract the actual token string
  const token = authHeader.split(" ")[1];

  try {
    // Verify it using your environment secret
    const verified = jwt.verify(token, process.env.JWT_SECRET);
    req.user = verified; // Attach the decoded user data (like their ID) to the request
    next();
  } catch (error) {
    res.status(401).json({ error: "Invalid token." });
  }
};

module.exports = fetchUser;
