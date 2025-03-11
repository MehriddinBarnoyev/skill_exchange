const pool = require("../db"); // PostgreSQL bazasi bilan ishlash uchun

// User profilini olish
const getUserProfile = async (req, res) => {
    try {
        const { id } = req.params;
        
        const userQuery = await pool.query(
            "SELECT id, name, bio, profile_pic, created_at , location FROM users WHERE id = $1",
            [id]
        );

        if (userQuery.rows.length === 0) {
            return res.status(404).json({ error: "User not found" });
        }

        const user = userQuery.rows[0];

        const skillsQuery = await pool.query(
            "SELECT id, description, level FROM skills WHERE user_id = $1",
            [id]
        );

        user.skills = skillsQuery.rows;

        res.json(user);
    } catch (err) {
        console.error("Error fetching user profile:", err);
        res.status(500).json({ error: "Server error" });
    }
};

module.exports = { getUserProfile };
