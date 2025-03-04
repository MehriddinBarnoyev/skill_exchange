const pool = require('../db');

const sendMessage = async (req, res) => {
    try {
        const { sender_id, reciever_id, message } = req.body;

        const newMessage = await pool.query("insert into messages (sender_id, reciever_id, message) values ($1, $2, $3) returning *", [sender_id, reciever_id, message]);
        res.json(newMessage.rows[0]);
    } catch (error) {
        console.log(error.message);
        res.status(500).send('Server Error');

    }
}

const getMessage = async (req, res) => {
    try {
        const { id } = req.params;

        const message = await pool.query("select * from messages where reciever_id = $1", [id]);

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