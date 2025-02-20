const express = require("express");
const { getUsers, getUserById } = require("../controllers/userController");
const authenticateToken = require("../middleware/authenticate");

const router = express.Router();

router.get("/", getUsers);
router.get("/:id", authenticateToken, getUserById); 

module.exports = router;
