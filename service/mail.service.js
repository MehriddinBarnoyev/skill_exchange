const nodemailer = require("nodemailer");
const pool = require("../db"); // PostgreSQL uchun

class MailService {
    constructor() {
        this.transporter = nodemailer.createTransport({
            host: process.env.SMTP_HOST,
            port: process.env.SMTP_PORT,
            secure: process.env.SMTP_SECURE === "true",
            auth: {
                user: process.env.SMTP_USER,
                pass: process.env.SMTP_PASSWORD,
            },
        });
    }

    async sendOtp(email, userId) {
        // 6 xonali OTP yaratamiz
        const otp = Math.floor(100000 + Math.random() * 900000).toString();
        console.log("Generated OTP:", otp);

        // OTPning muddati 5 daqiqa bo‘lishi kerak
        const expiresAt = new Date(Date.now() + 5 * 60 * 1000);

        // Eski OTPni o‘chiramiz (bir user uchun bitta bo‘lishi kerak)
        await pool.query("DELETE FROM otps WHERE user_id = $1", [userId]);

        // OTPni bazaga saqlaymiz
        await pool.query(
            "INSERT INTO otps (user_id, otp, expires_at) VALUES ($1, $2, $3)",
            [userId, otp, expiresAt]
        );

        // Emailga jo‘natamiz
        await this.transporter.sendMail({
            from: process.env.SMTP_USER,
            to: email,
            subject: "Your OTP Code",
            html: `<h1>Your OTP is: <b>${otp}</b></h1><p>This code is valid for 5 minutes.</p>`,
        });
    }

    async verifyOtp(email, otp) {
        // 1. Email orqali `user_id` ni topamiz
        const userQuery = await pool.query("SELECT id FROM users WHERE email = $1", [email]);

        if (userQuery.rows.length === 0) {
            throw new Error("User not found");
        }

        const userId = userQuery.rows[0].id;

        // 2. Eng oxirgi OTPni bazadan olish
        const otpQuery = await pool.query(
            "SELECT * FROM otps WHERE user_id = $1 ORDER BY expires_at DESC LIMIT 1",
            [userId]
        );

        if (otpQuery.rows.length === 0) {
            throw new Error("OTP not found");
        }

        const currentOtp = otpQuery.rows[0];

        // 3. Muddati tugagan yoki yo‘qligini tekshiramiz
        if (new Date(currentOtp.expires_at) < new Date()) {
            await pool.query("DELETE FROM otps WHERE user_id = $1", [userId]);
            throw new Error("OTP expired");
        }

        // 4. OTPni taqqoslaymiz
        if (currentOtp.otp !== otp) {
            throw new Error("Invalid OTP");
        }

        // 5. Agar OTP to‘g‘ri bo‘lsa, uni o‘chiramiz
        await pool.query("DELETE FROM otps WHERE user_id = $1", [userId]);

        return true;
    }

}

module.exports = new MailService();
