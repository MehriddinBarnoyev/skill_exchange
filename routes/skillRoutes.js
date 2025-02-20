const express = require('express');
const { getSkills, getSkillsById, addSkill, updateSkill, deleteSkill } = require('../controllers/skillController');

const router = express.Router();

router.get("/", getSkills);
router.get("/:id", getSkillsById);

router.post("/", addSkill);
router.put("/:id", updateSkill);
router.delete("/:id", deleteSkill);

module.exports = router;