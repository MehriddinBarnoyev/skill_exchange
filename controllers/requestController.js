const pool = require("../db");

const sendConnectionRequest = async (req, res) => {
    try {
        const { sender_id, receiver_id } = req.body;
        console.log(sender_id, receiver_id);
        

        if (sender_id === receiver_id) {
            return res.status(400).json({ message: "O'zingizga connect so‘rov yuborolmaysiz!" });
        }

        const existingRequest = await pool.query(
            "SELECT * FROM connections WHERE sender_id = $1 AND receiver_id = $2 AND status = 'pending'",
            [sender_id, receiver_id]
        );

        if (existingRequest.rows.length > 0) {
            return res.status(400).json({ message: "Connect request allaqachon yuborilgan!" });
        }

        const newRequest = await pool.query(
            "INSERT INTO connections (sender_id, receiver_id) VALUES ($1, $2) RETURNING *",
            [sender_id, receiver_id]
        );

        res.status(201).json(newRequest.rows[0]);

    } catch (error) {
        console.log(error.message);
        res.status(500).send("Server error");

    }
};

const respondToConnectionRequest = async (req, res) => {
    try {
        const { request_id, action } = req.body;

        if (!['accepted', 'rejected'].includes(action)) {
            return res.status(400).json({ message: "Noto‘g‘ri action!" });
        }

        // Statusni yangilash
        const updatedRequest = await pool.query(
            "UPDATE connections SET status = $1 WHERE id = $2 RETURNING *",
            [action, request_id]
        );

        res.json(updatedRequest.rows[0]);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Server xatosi" });
    }
};


const getConnectionRequests = async (req, res) => {
    try {
        const { user_id } = req.params;

        const requests = await pool.query(
            "SELECT * FROM connections WHERE receiver_id = $1 AND status = 'pending'",
            [user_id]
        );

        res.json(requests.rows);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Server xatosi" });
    }
};


module.exports = { sendConnectionRequest, getConnectionRequests, respondToConnectionRequest };