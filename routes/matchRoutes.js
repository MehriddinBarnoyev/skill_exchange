const express = require('express');
const { getMatches, getMatchById, createMatch, updateMatchStatus, deleteMatch, } = require("../controllers/matchesController");

const router = express.Router();

router.get("/", getMatches);
router.get("/:id", getMatchById);
router.post("/", createMatch);
router.put("/:id", updateMatchStatus);
router.delete("/:id", deleteMatch);

module.exports = router;