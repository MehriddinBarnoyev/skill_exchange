const express = require("express");

const { addReview,getUserReviews,getUserReview,updateReview, deleteReview } = require("../controllers/reviewsController");

const router = express.Router();


router.post("/", addReview);
router.get("/:id", getUserReviews);
router.get("/user/:userId", getUserReview);
router.put("/:id", updateReview);
router.delete("/:id", deleteReview);

module.exports = router;