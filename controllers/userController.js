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
        const { name, bio } = req.body;

        // Parametrlar ro'yxati
        const updates = [];
        const values = [];
        
        if (name) {
            updates.push(`name = $${values.length + 1}`);
            values.push(name);
        }
        if (bio) {
            updates.push(`bio = $${values.length + 1}`);
            values.push(bio);
        }

        // Agar yangilanishga hech narsa bo'lmasa, xatolik qaytaramiz
        if (updates.length === 0) {
            return res.status(400).json({ error: "No fields to update" });
        }

        // ID ni parametrlarga qo'shamiz
        values.push(id);
        
        // UPDATE so‘rovini tuzamiz
        const query = `UPDATE users SET ${updates.join(", ")} WHERE id = $${values.length} RETURNING *`;

        // So‘rovni bajarish
        const result = await pool.query(query, values);

        // Agar foydalanuvchi topilmasa
        if (result.rowCount === 0) {
            return res.status(404).json({ error: "User not found" });
        }

        // Yangilangan foydalanuvchini qaytaramiz
        res.json(result.rows[0]);
    } catch (error) {
        console.error("Update User Error:", error.message);
        res.status(500).json({ error: "Server error" });
    }
};



module.exports = { getUsers, getUserById , updateUser};
