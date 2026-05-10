const express = require("express");
const router = express.Router();
const User = require("../db/userModel");

router.post("/login", async (req, res) => {
  const { login_name, password } = req.body;

  console.log("=== LOGIN REQUEST ===");
  console.log("Request body:", req.body);
  console.log("login_name:", login_name);
  console.log("password:", password);

  if (!login_name) {
    console.log("ERROR: Missing login_name");
    return res.status(400).json({ error: "Missing login_name" });
  }

  try {
    const user = await User.findOne({ login_name: login_name });
    
    console.log("User found in DB:", user ? "YES" : "NO");
    if (user) {
      console.log("User data:", {
        _id: user._id,
        login_name: user.login_name,
        password_in_db: user.password,
        password_received: password
      });
    }

    if (!user) {
      console.log("ERROR: User not found -", login_name);
      return res.status(400).json({ error: "Invalid login name" });
    }

    if (password !== user.password) {
      console.log("ERROR: Password mismatch");
      console.log(`  Received: "${password}"`);
      console.log(`  In DB: "${user.password}"`);
      return res.status(400).json({ error: "Wrong password" });
    }

    req.session.userId = user._id;
    req.session.user = {
      _id: user._id,
      login_name: user.login_name,
      first_name: user.first_name,
      last_name: user.last_name
    };

    console.log("SUCCESS: Login successful for", login_name);
    
    res.json({
      _id: user._id,
      login_name: user.login_name,
      first_name: user.first_name,
      last_name: user.last_name
    });
  } catch (error) {
    console.error("Login error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

router.post("/logout", (req, res) => {
  if (!req.session || !req.session.userId) {
    return res.status(400).json({ error: "No user logged in" });
  }
  req.session.destroy((err) => {
    if (err) {
      return res.status(500).json({ error: "Logout failed" });
    }
    res.json({ message: "Logged out successfully" });
  });
});
router.get("/me", async (req, res) => {
  console.log("=== CHECK SESSION ===");
  console.log("Session ID:", req.session?.id);
  console.log("Session userId:", req.session?.userId);
  
  if (!req.session || !req.session.userId) {
    console.log("No active session");
    return res.status(401).json({ error: "Not logged in" });
  }
  
  try {
    const user = await User.findById(req.session.userId);
    if (!user) {
      console.log("User not found in DB");
      return res.status(401).json({ error: "User not found" });
    }
    
    console.log("Session active for user:", user.login_name);
    
    res.json({
      _id: user._id,
      login_name: user.login_name,
      first_name: user.first_name,
      last_name: user.last_name,
      location: user.location,
      description: user.description,
      occupation: user.occupation
    });
  } catch (error) {
    console.error("Error checking session:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

module.exports = router;