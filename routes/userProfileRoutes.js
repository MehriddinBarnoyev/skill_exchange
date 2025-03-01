const express = require("express");
const { getUserProfile } = require("../controllers/userProfileController");

const router = express.Router();
// User profilini olish uchun endpoint
router.get("/:id", getUserProfile);

module.exports = router;
