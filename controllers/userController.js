const pool = require("../db");

const getUsers = async (req, res) => {
    try {
        const users = await pool.query("SELECT id, name, email FROM users");
        res.json(users.rows);
    } catch (error) {
        console.error(error.message);
        res.status(500).send("Server error");
    }
};

const getUserById = async (req, res) => {
    try {
        const { id } = req.params; 
        const userIdFromToken = req.user.userId;

        console.log(req.user);
        
        const user = await pool.query("SELECT id, name, email FROM users WHERE id = $1", [id]);

        if (user.rows.length === 0) {
            return res.status(404).send("User not found");
        }

        const dbUserId = user.rows[0].id;

        console.log(dbUserId, userIdFromToken);
        

        if (dbUserId !== userIdFromToken) {
            return res.status(403).send("Access denied! You can only view your own profile.");
        }

        res.json(user.rows[0]);
    } catch (error) {
        console.error(error.message);
        res.status(500).send("Server error");
    }
};

module.exports = { getUsers, getUserById };
