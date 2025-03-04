const express = require('express');
const {
    getAllSkills,
    getSkillsById,
    addSkill,
    updateSkill,
    deleteSkill,
    getUserSkills
} = require('../controllers/skillController');

const router = express.Router();

router.get("/", getAllSkills);
router.get("/user/:userId", getUserSkills);
router.get("/:id", getSkillsById);
router.post("/addskill/:userId", addSkill);
router.put("/:id", updateSkill);
router.delete("/:id", deleteSkill);

module.exports = router;
