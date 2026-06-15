const mongoose = require("mongoose");

const reviewSchema = new mongoose.Schema(
  {
    userName: {
      type: String,
      required: [true, "userName is required"],
      trim: true,
    },
    userEmail: {
      type: String,
      required: [true, "userEmail is required"],
      trim: true,
      lowercase: true,
    },
    rating: {
      type: Number,
      required: [true, "rating is required"],
      min: [1, "Rating must be at least 1"],
      max: [5, "Rating cannot exceed 5"],
    },
    comment: {
      type: String,
      required: [true, "comment is required"],
      trim: true,
    },
  },
  {
    timestamps: { createdAt: "createdAt", updatedAt: false }, // only createdAt field
    versionKey: false, // omit __v field for cleaner response payloads
  }
);

module.exports = mongoose.model("Review", reviewSchema);
