const pool = require("../db");
const multer = require("multer");
const path = require("path");
const fs = require("fs");


// Configure multer storage
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        const uploadDir = "uploads/";
        if (!fs.existsSync(uploadDir)) {
            fs.mkdirSync(uploadDir);
        }
        cb(null, uploadDir);
    },
    filename: (req, file, cb) => {
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

// Initialize multer middleware
const upload = multer({ storage, fileFilter }).single("profile_image");

const getUsers = async (req, res) => {
    try {
        const users = await pool.query("SELECT id, name, email FROM users");
        res.json(users.rows);
    } catch (error) {
        console.error("Get Users Error:", error);
        res.status(500).json({ error: "Server error" });
    }
};

const completeProfile = async (req, res) => {
    try {
        const { id } = req.params;
        const updates = [];
        const values = [];
        const allowedFields = ["location", "profession", "gender", "education", "birth_date", "interests"];

        allowedFields.forEach((field) => {
            if (req.body[field] !== undefined) {
                updates.push(`${field} = $${values.length + 1}`);
                values.push(req.body[field]);
            }
        });

        if (!updates.length) {
            return res.status(400).json({ error: "No fields to update" });
        }

        values.push(id);
        const query = `UPDATE users SET ${updates.join(", ")}, is_profile_complete = TRUE WHERE id = $${values.length}`;
        await pool.query(query, values);

        res.json({ message: "Profile updated successfully" });
    } catch (error) {
        console.error("Complete Profile Error:", error);
        res.status(500).json({ error: "Server error" });
    }
};

const getUserById = async (req, res) => {
    try {
        const { id } = req.params;
        const userIdFromToken = req.user.userId;

        const user = await pool.query("SELECT id, name, email, location, profession, gender, education, birth_date, interests, is_profile_complete, profile_pic FROM users WHERE id = $1", [id]);

        if (!user.rows.length) {
            return res.status(404).json({ error: "User not found" });
        }

        if (user.rows[0].id !== userIdFromToken) {
            return res.status(403).json({ error: "Access denied! You can only view your own profile." });
        }

        res.json(user.rows[0]);
    } catch (error) {
        console.error("Get User By ID Error:", error);
        res.status(500).json({ error: "Server error" });
    }
};

const updateUser = async (req, res) => {
    try {
        const { id } = req.params;
        const { name, bio, email, birth_date } = req.body;
        const updates = [];
        const values = [];

        if (name) {
            if (typeof name !== "string" || name.trim() === "") {
                return res.status(400).json({ errors: { name: "Name must be a non-empty string" } });
            }
            updates.push(`name = $${values.length + 1}`);
            values.push(name);
        }
        if (bio) {
            if (typeof bio !== "string" || bio.length > 500) {
                return res.status(400).json({ errors: { bio: "Bio must be less than 500 characters" } });
            }
            updates.push(`bio = $${values.length + 1}`);
            values.push(bio);
        }
        if (email) {
            updates.push(`email = $${values.length + 1}`);
            values.push(email);
        }
        if (birth_date) {
            updates.push(`birth_date = $${values.length + 1}`);
            values.push(birth_date);
        }

        res.json(result.rows[0]);
    } catch (error) {
        console.error("Update User Error:", error);
        res.status(500).json({ error: "Server error" });
    }
};

const updateProfileImage = async (req, res) => {
    try {
        const { id } = req.params; // Get ID from token
        if (!req.file) {
            return res.status(400).json({ error: "No image uploaded" });
        }

        const imagePath = `${req.protocol}://${req.get("host")}/uploads/${req.file.filename}`;

        // Update database with new image path
        await pool.query("UPDATE users SET profile_pic= $1 WHERE id = $2", [imagePath, id]);

        res.status(200).json({ message: "Profile image updated successfully", imagePath });
    } catch (error) {
        console.error("Error updating profile image:", error);
        res.status(500).json({ error: "Server error" });
    }
};


module.exports = { getUsers, getUserById, updateUser, completeProfile, upload, updateProfileImage };
