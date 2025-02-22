const express = require("express");
const { getUsers, getUserById , updateUser} = require("../controllers/userController");
const authenticateToken = require("../middleware/authenticate");

const router = express.Router();

router.get("/", getUsers);
router.get("/:id", authenticateToken, getUserById); 
router.put("/:id", authenticateToken, updateUser);

module.exports = router;
