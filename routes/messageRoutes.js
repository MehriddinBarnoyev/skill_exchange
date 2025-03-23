const express = require('express');
const { sendMessage, getMessage, getConversation, deleteMessage, markMessagesAsRead } = require("../controllers/messageController");

const router = express.Router();

router.post("/", sendMessage);
router.post("/:id", getMessage);
router.put("/mark-as-read", markMessagesAsRead);
router.get("/conversation/:matchId", getConversation);
router.delete("/:id", deleteMessage);

module.exports = router;