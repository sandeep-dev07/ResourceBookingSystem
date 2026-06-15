const express = require("express");
const router = express.Router();
const {
  createReview,
  getReviews,
  getReviewById,
  updateReview,
  deleteReview,
} = require("../controllers/reviewController");

router.route("/")
  .post(createReview)
  .get(getReviews);

router.route("/:id")
  .get(getReviewById)
  .put(updateReview)
  .delete(deleteReview);

module.exports = router;
