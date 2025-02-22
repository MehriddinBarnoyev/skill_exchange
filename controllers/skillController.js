const pool = require("../db");

// get all skills
const getAllUserSkills = async (req, res) => {
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
        const skills = await pool.query("select * from skills where id = $1", [id])
        res.status(200).json(skills.rows[0]);
    } catch (error) {
        console.log(error.message);
        res.status(500).send("Server error");

    }
}

// add skill
const addSkill = async (req, res) => {
    try {
        const { user_id, name, description } = req.body;

        const result = await pool.query(
            "INSERT INTO skills (id, user_id, name, description) VALUES (gen_random_uuid(), $1, $2, $3) RETURNING *",
            [user_id, name, description]
        ); res.status(200).json(result.rows[0]);
    } catch (error) {
        console.log(error.message);
        res.status(500).send("Server error");

    }
}

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

module.exports = { getAllUserSkills, getSkillsById, addSkill, updateSkill, deleteSkill };