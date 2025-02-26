const pool = require("../db");

// get all skills
const getAllSkills = async (req, res) => {
    try {
        const result = await pool.query(`SELECT  
    users.id AS user_id, 
    users.name AS user_name, 
    skills.id AS skill_id, 
    skills.description as description,
    skills.name AS skill_name, 
    skills.created_at AS created_at
FROM skills
JOIN users ON skills.user_id = users.id;
`);

        res.json(result.rows);
    } catch (error) {
        console.error("Error fetching user skills:", error.message);
        res.status(500).json({ error: "Internal Server Error" });
    }
};

// get skill by id
const getSkillsById = async (req, res) => {
    try {
        const { id } = req.params;
        const skills = await pool.query("select * from skills where id = $1 ", [id])
        console.log(skills.rows);

        res.status(200).json(skills.rows[0]);
    } catch (error) {
        console.log(error.message);
        res.status(500).send("Server error");

    }
}

const getUserSkills = async (req, res) => {
    try {
        console.log("Params:", req.params);
        let { userId } = req.params;

        userId = userId.trim(); // 🔥 "\n" yoki bo‘sh joylarni olib tashlaymiz

        if (!userId) {
            console.log("❌ User ID yo‘q!");
            return res.status(400).json({ error: "User ID is required" });
        }
        console.log("Id :", userId);


        console.log("🔍 Query boshlanyapti...");
        const result = await pool.query(
            "SELECT * FROM skills WHERE user_id = $1",
            [userId]
        );

        console.log("✅ Query natijasi:", result.rows);

        if (result.rows.length === 0) {
            return res.status(404).json({ error: "No skills found for this user" });
        }

        res.status(200).json({ success: true, skills: result.rows });
    } catch (error) {
        console.error("❌ ERROR:", error.message);
        res.status(500).json({ error: "Internal Server Error" });
    }
};





const addSkill = async (req, res) => {
    try {
        const { userId } = req.params; // user_id params orqali olinadi
        const { name, description } = req.body;
        console.log(name, description, userId);


        // 🔥 1. INPUT VALIDATION
        if (!userId || !name || !description) {
            return res.status(400).json({ error: "All fields are required (userId, name, description)" });
        }

        // 🔥 3. INSERT INTO DATABASE
        const result = await pool.query(
            "INSERT INTO skills (id, user_id, name, description) VALUES (gen_random_uuid(), $1, $2, $3) RETURNING *",
            [userId.trim(), name, description]
        );

        
        
        res.status(201).json({ success: true, skill: result.rows[0] });
    } catch (error) {
        console.error("❌ ERROR:", error.message);
        res.status(500).json({ error: "Internal Server Error" });
    }
};


// update skill
const updateSkill = async (req, res) => {
    try {
        const { id } = req.params;
        const { name, description } = req.body;

        const result = await pool.query("update skills set name = $1, description = $2 where id = *3 returning *", [name, description, id]);

        if (result.rows.length === 0) {
            return res.status(404).send("Skill not found");
        }
        res.status(200).json(result.rows[0]);
    } catch (error) {
        console.log(error.message);
        res.status(500).send("Server error");

    }
}

// delete skill
const deleteSkill = async (req, res) => {
    try {
        const { id } = req.params;
        const result = await pool.query("delete from skills where id = $1 returning *", [id]);

        if (result.rows.length === 0) {
            return res.status(404).send("Skill not found");
        }
        res.status(200).json(result.rows[0]);
    } catch (error) {
        console.log(error.message);
        res.status(500).send("Server error");

    }
}

module.exports = { getAllSkills, getSkillsById, addSkill, updateSkill, deleteSkill, getUserSkills };