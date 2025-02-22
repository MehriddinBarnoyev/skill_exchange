const pool = require('../db');


const addReview = async (req, res) => {
    try {
        const { reviewer_id, reviewee_id, skill_id, rating, comment } = req.body;

        const newReview = await pool.query("insert into reviews (reviewer_id, reviewee_id, skill_id, rating, comment) values ($1, $2, $3, $4, $5) returning *", [reviewer_id, reviewee_id, skill_id, rating, comment]);
        res.json(newReview.rows[0]);
    } catch (error) {
        console.log(error.message);
        res.status(500).send('Server Error');

    }
}

const getUserReviews = async (req, res) => {
    try {
        const { id } = req.params;
        const reviews = await pool.query("select * from reviews where reviewee_id = $1", [id]);
        res.json(reviews.rows);
    } catch (error) {
        console.log(error.message);
        res.status(500).send('Server Error');
    }
}


const getUserReview = async (req, res) => {
    try {
        const { userId } = req.params;

        const reviews = await pool.query("select * from reviews where reviewee_id = $1", [userId]);
    } catch (error) {
        console.log(error.message);
        res.status(500).send('Server Error');

    }
}

const updateReview = async (req, res) => {
    try {
        const { id } = req.params;
        const { rating, comment } = req.body;

        const updatedReview = await pool.query(
            `UPDATE reviews SET rating = $1, comment = $2, updated_at = CURRENT_TIMESTAMP WHERE id = $3 RETURNING *`,
            [rating, comment, id]
        );

        if (updatedReview.rows.length === 0) {
            return res.status(404).send("Review not found");
        }

        res.json(updatedReview.rows[0]);
    } catch (error) {
        console.error(error.message);
        res.status(500).send("Server error");
    }
};

// Reviewni o‘chirish
const deleteReview = async (req, res) => {
    try {
        const { id } = req.params;
        const deletedReview = await pool.query(`DELETE FROM reviews WHERE id = $1 RETURNING *`, [id]);

        if (deletedReview.rows.length === 0) {
            return res.status(404).send("Review not found");
        }

        res.json({ message: "Review deleted successfully" });
    } catch (error) {
        console.error(error.message);
        res.status(500).send("Server error");
    }
};

module.exports = {
    addReview,
    getUserReviews,
    getUserReview,
    updateReview,
    deleteReview
};