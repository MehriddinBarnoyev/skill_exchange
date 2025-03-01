const express = require('express');

const { sendConnectionRequest, respondToConnectionRequest, getConnectionRequests } = require("../controllers/requestController");

const router = express.Router();

router.post("/request", sendConnectionRequest);
router.put("/respond", respondToConnectionRequest);
router.get("/:user_id", getConnectionRequests);

module.exports = router;