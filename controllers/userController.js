const pool = require("../db");
const multer = require("multer");
const path = require("path");

// Configure multer storage
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, "uploads/"); // Save images in the uploads folder
    },
    filename: function (req, file, cb) {
        cb(null, Date.now() + path.extname(file.originalname)); // Unique filename
    }
});

// File filter (only allow images)
const fileFilter = (req, file, cb) => {
    if (file.mimetype.startsWith("image/")) {
        cb(null, true);
    } else {
        cb(new Error("Only image files are allowed!"), false);
    }
};

exports.upload = multer({ storage, fileFilter })

const getUsers = async (req, res) => {
    try {
        const users = await pool.query("SELECT id, name, email FROM users");
        res.json(users.rows);
    } catch (error) {
        console.error(error.message);
        res.status(500).send("Server error");
    }
};

const completeProfile = async (req, res) => {
    try {
        const { id } = req.params;
        const updates = [];
        const values = [];

        const fields = {
            location: req.body.location,
            profession: req.body.profession,
            gender: req.body.gender,
            education: req.body.education,
            birth_date: req.body.birth_date,
            interests: req.body.interests
        };

        // Faqat qiymati bor maydonlarni qo'shamiz
        Object.keys(fields).forEach((key, index) => {
            if (fields[key] !== undefined) {
                updates.push(`${key} = $${values.length + 1}`);
                values.push(fields[key]);
            }
        });

        if (updates.length === 0) {
            return res.status(400).json({ error: "No fields to update" });
        }

        values.push(id); // User ID ni so‘rovga qo‘shamiz

        const query = `UPDATE users SET ${updates.join(", ")}, is_profile_complete = TRUE WHERE id = $${values.length}`;

        await pool.query(query, values);

        res.status(200).json({ message: "Profile updated successfully" });
    } catch (error) {
        console.log(error.message);
        res.status(500).send("Server Error");
    }

}

const getUserById = async (req, res) => {
    try {
        const { id } = req.params;
        const userIdFromToken = req.user.userId;

        const user = await pool.query("SELECT id, name, email,location, profession, gender, education, birth_date, interests, is_profile_complete  FROM users WHERE id = $1", [id]);

        if (user.rows.length === 0) {
            return res.status(404).send("User not found");
        }

        const dbUserId = user.rows[0].id;

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


module.exports = { getUsers, getUserById, updateUser, completeProfile };
