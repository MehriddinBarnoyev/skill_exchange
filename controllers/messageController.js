const pool = require('../db');

const sendMessage = async (req, res) => {
    try {
        const { sender_id, reciever_id, message } = req.body;

        const newMessage = await pool.query("insert into messages (sender_id, receiver_id, content) values ($1, $2, $3) returning *", [sender_id, reciever_id, message]);
        res.json(newMessage.rows[0]);
    } catch (error) {
        console.log(error.message);
        res.status(500).send('Server Error');

    }
}

const getMessage = async (req, res) => {
    try {
        const { id } = req.params;
        const { reciever_id } = req.body;

        const message = await pool.query(`SELECT 
                m.id,
                m.content,
                m.created_at,
                sender.id AS sender_id,
                sender.name AS sender_name,
                sender.profile_pic AS sender_profile_pic,
                receiver.id AS receiver_id,
                receiver.name AS receiver_name,
                receiver.profile_pic AS receiver_profile_pic
                FROM messages m
                JOIN users sender ON m.sender_id = sender.id
                JOIN users receiver ON m.receiver_id = receiver.id
                WHERE m.sender_id = $1 OR m.receiver_id = $2
                ORDER BY m.created_at DESC;`, [id, reciever_id]);

        if (message.rows.length === 0) {
            return res.status(404).send("Message not found");
        }
        res.json(message.rows);
    } catch (error) {
        console.log(error.message);
        res.status(500).send('Server Error');

    }
}

const getConversation = async (req, res) => {
    try {
        const { matchId } = req.params;
        const messages = await pool.query(
            `SELECT * FROM messages WHERE match_id = $1 ORDER BY created_at ASC`,
            [matchId]
        );

        res.json(messages.rows);
    } catch (error) {
        console.error(error.message);
        res.status(500).send("Server error");
    }
};


const deleteMessage = async (req, res) => {
    try {
        const { id } = req.params;
        const deletedMessage = await pool.query(`DELETE FROM messages WHERE id = $1 RETURNING *`, [id]);

        if (deletedMessage.rows.length === 0) {
            return res.status(404).send("Message not found");
        }

        res.json({ message: "Message deleted successfully" });
    } catch (error) {
        console.error(error.message);
        res.status(500).send("Server error");
    }
};

module.exports = { sendMessage, getMessage, getConversation, deleteMessage };