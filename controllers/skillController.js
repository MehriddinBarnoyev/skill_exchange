const pool = require("../db");

// get all skills
const getSkills = async (req, res) => {
    try {
        const skills = await pool.query("select * from skills");
        res.status(200).json(skills.rows);
    } catch (error) {
        console.log(error.message);
        res.status(500).send("Server error");
    }
}

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

module.exports = { getSkills, getSkillsById, addSkill, updateSkill, deleteSkill };