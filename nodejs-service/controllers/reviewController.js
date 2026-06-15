const Review = require("../models/Review");

// @desc    Create a new review
// @route   POST /reviews
// @access  Public (React frontend provides user info)
exports.createReview = async (req, res, next) => {
  try {
    const { userName, userEmail, rating, comment } = req.body;

    // Manual validation checks
    if (!comment || comment.trim() === "") {
      return res.status(400).json({ success: false, message: "Comment is required" });
    }

    if (rating === undefined || rating < 1 || rating > 5) {
      return res.status(400).json({ success: false, message: "Rating must be between 1 and 5" });
    }

    if (!userName || !userEmail) {
      return res.status(400).json({ success: false, message: "User name and email are required" });
    }

    const newReview = new Review({
      userName,
      userEmail,
      rating,
      comment,
    });

    const savedReview = await newReview.save();
    res.status(201).json({ success: true, data: savedReview });
  } catch (error) {
    next(error);
  }
};

// @desc    Get all reviews
// @route   GET /reviews
// @access  Public
exports.getReviews = async (req, res, next) => {
  try {
    const reviews = await Review.find().sort({ createdAt: -1 });
    res.status(200).json({ success: true, count: reviews.length, data: reviews });
  } catch (error) {
    next(error);
  }
};

// @desc    Get a single review by ID
// @route   GET /reviews/:id
// @access  Public
exports.getReviewById = async (req, res, next) => {
  try {
    const review = await Review.findById(req.params.id);
    if (!review) {
      return res.status(404).json({ success: false, message: "Review not found" });
    }
    res.status(200).json({ success: true, data: review });
  } catch (error) {
    next(error);
  }
};

// @desc    Update a review by ID
// @route   PUT /reviews/:id
// @access  Public (matches creator email on React side)
exports.updateReview = async (req, res, next) => {
  try {
    const { rating, comment } = req.body;

    // Simple validations
    if (comment !== undefined && comment.trim() === "") {
      return res.status(400).json({ success: false, message: "Comment is required" });
    }

    if (rating !== undefined && (rating < 1 || rating > 5)) {
      return res.status(400).json({ success: false, message: "Rating must be between 1 and 5" });
    }

    const review = await Review.findById(req.params.id);
    if (!review) {
      return res.status(404).json({ success: false, message: "Review not found" });
    }

    if (rating !== undefined) review.rating = rating;
    if (comment !== undefined) review.comment = comment;

    const updatedReview = await review.save();
    res.status(200).json({ success: true, data: updatedReview });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete a review by ID
// @route   DELETE /reviews/:id
// @access  Public
exports.deleteReview = async (req, res, next) => {
  try {
    const review = await Review.findById(req.params.id);
    if (!review) {
      return res.status(404).json({ success: false, message: "Review not found" });
    }

    await review.deleteOne();
    res.status(200).json({ success: true, message: "Review deleted successfully" });
  } catch (error) {
    next(error);
  }
};
