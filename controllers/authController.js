const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const pool = require("../db");
const mailService = require("../service/mail.service");

const register = async (req, res) => {
    try {
        const { email, password, name, otp } = req.body;


        // 1. User allaqachon mavjudligini tekshiramiz
        const userExists = await pool.query("SELECT id FROM users WHERE email = $1", [email]);

        if (userExists.rows.length > 0) {
            return res.status(400).json({ error: "User already exists" });
        }

        // 2. Agar OTP kiritilmagan bo‘lsa, foydalanuvchini vaqtincha bazaga yozamiz
        if (!otp) {
            const tempUser = await pool.query(
                "INSERT INTO users (name, email, password) VALUES ($1, $2, $3) RETURNING id",
                [name, email, password]
            );

            const userId = tempUser.rows[0].id;

            // OTP yuboramiz
            await mailService.sendOtp(email, userId);

            return res.status(200).json({ message: "OTP sent to email", user_id: userId });
        }

        // 3. Agar OTP bor bo‘lsa, uni tekshiramiz
        const userResult = await pool.query("SELECT id FROM users WHERE email = $1", [email]);

        if (userResult.rows.length === 0) {
            return res.status(404).json({ error: "User not found" });
        }

        const userId = userResult.rows[0].id;
        const isOtpValid = await mailService.verifyOtp(email, otp, userId);

        if (!isOtpValid) {
            return res.status(400).json({ error: "Invalid OTP" });
        }

        // 4. Parolni hash qilib, userni yangilaymiz
        const hashedPassword = await bcrypt.hash(password, 10);
        await pool.query("UPDATE users SET password = $1 WHERE id = $2", [hashedPassword, userId]);

        // 5. Token yaratamiz
        const token = jwt.sign({ userId }, process.env.JWT_SECRET, { expiresIn: "1h" });

        res.status(201).json({ message: "Registration successful", token, user_id: userId });

    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

const login = async (req, res) => {
    try {
        const { email, otp } = req.body;

        // 1. Userni bazadan topamiz
        const userQuery = await pool.query("SELECT * FROM users WHERE email = $1", [email]);

        if (userQuery.rows.length === 0) {
            return res.status(404).json({ error: "User not found" });
        }

        const user = userQuery.rows[0];
        const userId = user.id;

        // 2. Agar OTP yo'q bo‘lsa, emailga yuboramiz
        if (!otp) {
            await mailService.sendOtp(email, userId);
            return res.status(200).json({ message: "OTP sent to email", user_id: userId });
        }

        // 3. OTPni tekshiramiz
        const isOtpValid = await mailService.verifyOtp(email, otp, userId);

        if (!isOtpValid) {
            return res.status(400).json({ error: "Invalid OTP" });
        }

        // 4. Token yaratamiz
        const token = jwt.sign({ userId }, process.env.JWT_SECRET, { expiresIn: "1h" });

        res.status(200).json({ message: "Login successful", token, user_id: userId });

    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};


const verifyOtp = async (req, res) => {
    try {
        const { email, otp, user_id } = req.body;

        // `user_id` yo'q bo'lsa, email orqali bazadan topamiz
        let userId = user_id;

        if (!userId) {
            const userResult = await pool.query("SELECT id FROM users WHERE email = $1", [email]);
            if (userResult.rows.length === 0) {
                return res.status(404).json({ error: "User not found" });
            }
            userId = userResult.rows[0].id;
        }

        // OTPni tekshiramiz
        const isOtpValid = await mailService.verifyOtp(email, otp, userId);
        if (!isOtpValid) {
            return res.status(401).json({ error: "Invalid or expired OTP" });
        }

        // Token yaratamiz
        const token = jwt.sign({ userId }, process.env.JWT_SECRET, { expiresIn: "1h" });

        return res.status(200).json({
            message: "OTP verified",
            token,
            user_id: userId
        });

    } catch (err) {
        return res.status(500).json({ error: err.message });
    }
};

module.exports = { register, login, verifyOtp };
