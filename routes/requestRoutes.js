const express = require('express');

const { sendConnectionRequest, respondToConnectionRequest, getConnectionRequests , getFriends, deleteFriend} = require("../controllers/requestController");

const router = express.Router();

router.post("/request", sendConnectionRequest);
router.put("/respond", respondToConnectionRequest);
router.get("/:user_id", getConnectionRequests);
router.get("/friends/:user_id", getFriends);
router.delete("/delete/:user_id", deleteFriend);

module.exports = router;