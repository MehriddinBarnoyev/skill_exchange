const express = require("express");
const { getUsers, getUserById, updateUser, completeProfile, upload, updateProfileImage } = require("../controllers/userController");
const authenticateToken = require("../middleware/authenticate");

const router = express.Router();

router.get("/", getUsers);
router.get("/:id", authenticateToken, getUserById);
router.post("/:id", authenticateToken, updateUser);
router.post("/complete-profile/:id", authenticateToken, completeProfile);
router.post("/upload-profile-image/:id", upload, updateProfileImage);


module.exports = router;
