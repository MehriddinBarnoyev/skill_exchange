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

const updateUser = async (req, res) => {
    try {
        const { id } = req.params;
        const { name, bio } = req.body; // Email olinmaydi

        // Yangi qiymatlar faqat berilgan maydonlarni yangilash uchun
        const updates = [];
        const values = [];
        let query = "UPDATE users SET";

        if (name) {
            updates.push(" name = $1");
            values.push(name);
        }
        if (bio) {
            updates.push(" bio = $" + (values.length + 1));
            values.push(bio);
        }

        if (updates.length === 0) {
            return res.status(400).json({ error: "No fields to update" });
        }

        query += updates.join(",") + " WHERE id = $" + (values.length + 1) + " RETURNING *";
        values.push(id);

        const result = await pool.query(query, values);

        if (result.rows.length === 0) {
            return res.status(404).json({ error: "User not found" });
        }

        res.json(result.rows[0]);
    } catch (error) {
        console.error(error.message);
        res.status(500).json({ error: "Server error" });
    }
};


module.exports = { getUsers, getUserById , updateUser};
