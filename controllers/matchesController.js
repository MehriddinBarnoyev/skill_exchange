const pool = require('../db');

const getMatches = async (req, res) => {
    try {
        const result = await pool.query("SELECT * FROM matches");
        res.status(200).json(result.rows);
    } catch (error) {
        console.log(error.message);
        res.status(500).send("Server error");

    }
}

const getMatchById = async (req, res) => {
    try {
        const { id } = req.params;
        const result = await pool.query("SELECT * FROM matches WHERE id = $1", [id]);

        if (result.rows.length === 0) {
            return res.status(404).send("Match not found");
        }
        res.status(200).json(result.rows[0]);
    } catch (error) {
        console.log(error.message);
        res.status(500).send("Server error");

    }
}

const createMatch = async (req, res) => {
    try {
        const { user1_id, user2_id, skill_id } = req.body;

        const newMatch = pool.query("insert into matches (user1_id, user2_id, skill_id) values ($1, 2$, $3) returning ", [user1_id, user2_id, skill_id]);
        res.status(200).json(newMatch.rows[0]);
    } catch (error) {
        console.log(error.message);
        res.status(500).send("Server error");

    }
}


const updateMatchStatus = async (req, res) => {
    try {
        const { id } = req.params;
        const { status } = req.body;

        const updatedMatch = await pool.query(
            "UPDATE matches SET status = $1, updated_at = CURRENT_TIMESTAMP WHERE id = $2 RETURNING *",
            [status, id]
        );

        if (updatedMatch.rows.length === 0) {
            return res.status(404).send("Match not found");
        }

        res.json(updatedMatch.rows[0]);
    } catch (error) {
        console.error(error.message);
        res.status(500).send("Server error");
    }
};

// Matchni o‘chirish
const deleteMatch = async (req, res) => {
    try {
        const { id } = req.params;
        const deletedMatch = await pool.query("DELETE FROM matches WHERE id = $1 RETURNING *", [id]);

        if (deletedMatch.rows.length === 0) {
            return res.status(404).send("Match not found");
        }

        res.send("Match deleted successfully");
    } catch (error) {
        console.error(error.message);
        res.status(500).send("Server error");
    }
};

module.exports = {
    getMatches,
    getMatchById,
    createMatch,
    updateMatchStatus,
    deleteMatch,
};