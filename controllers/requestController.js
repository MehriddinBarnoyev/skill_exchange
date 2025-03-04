const pool = require("../db");

const sendConnectionRequest = async (req, res) => {
    try {
        const { sender_id, receiver_id } = req.body;


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
            `SELECT 
    c.id,
    c.sender_id,
    sender.name AS sender_name,
    c.receiver_id,
    receiver.name AS receiver_name,
    c.status
FROM connections c
JOIN users sender ON c.sender_id = sender.id
JOIN users receiver ON c.receiver_id = receiver.id
WHERE c.receiver_id ='${user_id}' AND c.status = 'pending';
`

        );



        res.json(requests.rows);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Server xatosi" });
    }
};

const getFriends = async (req, res) => {
    try {

        const { user_id } = req.params;

        const response = await pool.query(`SELECT 
    c.id,
    CASE 
        WHEN c.sender_id = $1 THEN receiver.id
        ELSE sender.id
    END AS connected_user_id,

    CASE 
        WHEN c.sender_id = $1 THEN receiver.name
        ELSE sender.name
    END AS connected_user_name,

    CASE 
        WHEN c.sender_id = $1 THEN receiver.profile_picture
        ELSE sender.profile_picture
    END AS connected_user_profile_picture,

    CASE 
        WHEN c.sender_id = $1 THEN receiver.profession
        ELSE sender.profession
    END AS connected_user_profession

FROM connections c
JOIN users sender ON c.sender_id = sender.id
JOIN users receiver ON c.receiver_id = receiver.id
WHERE (c.sender_id = $1 OR c.receiver_id = $1) AND c.status = 'accepted';
`, [user_id]);

        res.json(response.rows);
    } catch (error) {
        console.log(error.message);
        res.status(500).send("Server error");

    }
}

module.exports = { sendConnectionRequest, getConnectionRequests, respondToConnectionRequest, getFriends };