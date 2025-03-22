const express = require('express');
const { sendMessage, getMessage, getConversation, deleteMessage } = require("../controllers/messageController");

const router = express.Router();

router.post("/", sendMessage);
router.post("/:id", getMessage);
router.get("/conversation/:matchId", getConversation);
router.delete("/:id", deleteMessage);

module.exports = router;