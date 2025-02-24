const express = require('express');
const {  
    getAllUserSkills, 
    getSkillsById, 
    addSkill, 
    updateSkill, 
    deleteSkill, 
    getUserSkills 
} = require('../controllers/skillController');

const router = express.Router();

router.get("/", getAllUserSkills);         // Barcha userlarning skillari
router.get("/user/:userId", getUserSkills); // Foydalanuvchi bo‘yicha skill
router.get("/:id", getSkillsById);         // Bitta skillni ID bo‘yicha olish
router.post("/addskill/:userId", addSkill);                // Skill qo‘shish
router.put("/:id", updateSkill);           // Skillni yangilash
router.delete("/:id", deleteSkill);        // Skillni o‘chirish

module.exports = router;
