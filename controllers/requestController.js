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
    sender.profile_pic AS sender_profile_pic,
    c.receiver_id,
    receiver.name AS receiver_name,
    receiver.profile_pic AS receiver_profile_pic, 
    c.status,
    c.created_at 
FROM connections c
JOIN users sender ON c.sender_id = sender.id
JOIN users receiver ON c.receiver_id = receiver.id
WHERE c.receiver_id = '${user_id}' AND c.status = 'pending';


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
        WHEN c.sender_id = $1 THEN receiver.profile_pic
        ELSE sender.profile_pic
    END AS connected_user_profile_pic,

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

const deleteFriend = async (req, res) => {
    try {
        const { user_id } = req.params;
        const { friend_id } = req.body;

        const response = await pool.query(
            `DELETE FROM connections 
             WHERE (sender_id = $1 AND receiver_id = $2) 
             OR (sender_id = $2 AND receiver_id = $1)`,
            [user_id, friend_id]
        );

        if (response.rowCount === 0) {
            return res.status(404).json({ success: false, message: "Connection not found" });
        }

        res.json({ success: true, message: "Friend deleted successfully" });
    } catch (error) {
        console.error(error.message);
        res.status(500).send("Server error");
    }
};


module.exports = { sendConnectionRequest, getConnectionRequests, respondToConnectionRequest, getFriends, deleteFriend };