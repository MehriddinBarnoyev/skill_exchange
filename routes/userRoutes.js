const express = require("express");
const { getUsers, getUserById, updateUser, completeProfile, upload } = require("../controllers/userController");
const authenticateToken = require("../middleware/authenticate");

const router = express.Router();

router.get("/", getUsers);
router.get("/:id", authenticateToken, getUserById);
router.put("/:id", authenticateToken, updateUser);
router.post("/complete-profile/:id", authenticateToken, completeProfile);

module.exports = router;
