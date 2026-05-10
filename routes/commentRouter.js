const express = require("express");
const router = express.Router();
const mongoose = require("mongoose");
const Photo = require("../db/photoModel");
const { requireLogin } = require("../middleware/auth");

router.post("/commentsOfPhoto/:photo_id", requireLogin, async (req, res) => {
  const photoId = req.params.photo_id;
  const { comment } = req.body;
  const userId = req.session.userId;

  console.log("Add comment to photo:", photoId, "by user:", userId);

  if (!mongoose.Types.ObjectId.isValid(photoId)) {
    return res.status(400).json({ error: "Invalid photo ID format" });
  }

  if (!comment || comment.trim() === "") {
    return res.status(400).json({ error: "Comment cannot be empty" });
  }

  try {
    const photo = await Photo.findById(photoId);

    if (!photo) {
      return res.status(404).json({ error: "Photo not found" });
    }

    const newComment = {
      comment: comment.trim(),
      date_time: new Date(),
      user_id: userId
    };

    photo.comments.push(newComment);
    await photo.save();

    const savedComment = photo.comments[photo.comments.length - 1];

    res.status(201).json({
      _id: savedComment._id,
      comment: savedComment.comment,
      date_time: savedComment.date_time,
      user_id: savedComment.user_id
    });
  } catch (error) {
    console.error("Error adding comment:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

module.exports = router;