const express = require("express");
const router = express.Router();
const mongoose = require("mongoose");
const User = require("../db/userModel");

router.get("/list", async (req, res) => {
  try {
    const users = await User.find(
      {},
      "_id first_name last_name"
    ).lean();
    res.json(users);
  } catch (error) {
    console.error("Error fetching user list:", error);
    res.status(500).json({ message: "Internal server error" });
  }
});

router.get("/:id", async (req, res) => {
  const userId = req.params.id;

  if (!mongoose.Types.ObjectId.isValid(userId)) {
    return res.status(400).json({
      message: "Invalid user ID format."
    });
  }

  try {
    const user = await User.findById(
      userId,
      "_id first_name last_name location description occupation"
    ).lean();

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    res.json(user);
  } catch (error) {
    console.error("Error fetching user detail:", error);
    res.status(500).json({ message: "Internal server error" });
  }
});

router.post("/", async (req, res) => {
  const {
    login_name,
    password,
    first_name,
    last_name,
    location,
    description,
    occupation
  } = req.body;

  console.log("Register attempt:", login_name);

  if (!login_name || login_name.trim() === "") {
    return res.status(400).json({ error: "login_name is required" });
  }

  if (!first_name || first_name.trim() === "") {
    return res.status(400).json({ error: "first_name is required" });
  }

  if (!last_name || last_name.trim() === "") {
    return res.status(400).json({ error: "last_name is required" });
  }

  if (!password || password.trim() === "") {
    return res.status(400).json({ error: "password is required" });
  }

  try {
    const existingUser = await User.findOne({ login_name });
    if (existingUser) {
      return res.status(400).json({ error: "Login name already exists" });
    }

    const newUser = new User({
      login_name: login_name.trim(),
      password: password,  
      first_name: first_name.trim(),
      last_name: last_name.trim(),
      location: location || "",
      description: description || "",
      occupation: occupation || ""
    });

    await newUser.save();

    console.log("User registered:", login_name);

    res.status(201).json({
      _id: newUser._id,
      login_name: newUser.login_name,
      first_name: newUser.first_name,
      last_name: newUser.last_name
    });
  } catch (error) {
    console.error("Register error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

module.exports = router;