const express = require("express");
const router = express.Router();
const mongoose = require("mongoose");
const multer = require("multer");
const path = require("path");
const crypto = require("crypto");
const Photo = require("../db/photoModel");
const User = require("../db/userModel");
const { requireLogin } = require("../middleware/auth");

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "images/");  
  },
  filename: function (req, file, cb) {
    const uniqueName = crypto.randomBytes(16).toString("hex") + path.extname(file.originalname);
    cb(null, uniqueName);
  }
});

const upload = multer({
  storage: storage,
  limits: { fileSize: 5 * 1024 * 1024 }, 
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith("image/")) {
      cb(null, true);
    } else {
      cb(new Error("Only image files are allowed"), false);
    }
  }
});

router.get("/photosOfUser/:id", async (req, res) => {
  const userId = req.params.id;

  if (!mongoose.Types.ObjectId.isValid(userId)) {
    return res.status(400).json({
      message: "Invalid user ID format."
    });
  }

  try {
    const photos = await Photo.find({ user_id: userId }).lean();

    if (!photos || photos.length === 0) {
      return res.json([]);
    }

    const userIdsFromComments = new Set();
    for (const photo of photos) {
      if (photo.comments && photo.comments.length > 0) {
        for (const comment of photo.comments) {
          if (comment.user_id) {
            userIdsFromComments.add(comment.user_id.toString());
          }
        }
      }
    }

    const usersMap = new Map();
    if (userIdsFromComments.size > 0) {
      const users = await User.find(
        { _id: { $in: Array.from(userIdsFromComments) } },
        "_id first_name last_name"
      ).lean();

      users.forEach(user => {
        usersMap.set(user._id.toString(), {
          _id: user._id,
          first_name: user.first_name,
          last_name: user.last_name
        });
      });
    }

    const transformedPhotos = photos.map(photo => {
      const transformedComments = (photo.comments || []).map(comment => ({
        _id: comment._id,
        comment: comment.comment,
        date_time: comment.date_time,
        user: usersMap.get(comment.user_id?.toString()) || {
          _id: comment.user_id,
          first_name: "Unknown",
          last_name: "User"
        }
      }));

      return {
        _id: photo._id,
        user_id: photo.user_id,
        comments: transformedComments,
        file_name: photo.file_name,
        date_time: photo.date_time
      };
    });

    res.json(transformedPhotos);
  } catch (error) {
    console.error("Error fetching user photos:", error);
    res.status(500).json({ message: "Internal server error" });
  }
});

router.post("/photos/new", requireLogin, upload.single("photo"), async (req, res) => {
  console.log("Upload photo attempt by user:", req.session.userId);

  if (!req.file) {
    return res.status(400).json({ error: "No file uploaded" });
  }

  try {
    const newPhoto = new Photo({
      file_name: req.file.filename,
      date_time: new Date(),
      user_id: req.session.userId,
      comments: []
    });

    await newPhoto.save();

    console.log("Photo uploaded:", req.file.filename, "by user:", req.session.userId);

    res.status(201).json({
      _id: newPhoto._id,
      file_name: newPhoto.file_name,
      date_time: newPhoto.date_time,
      user_id: newPhoto.user_id,
      comments: []
    });
  } catch (error) {
    console.error("Error uploading photo:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

module.exports = router;