const express = require("express");
const cors = require("cors");
require("dotenv").config();

const authRoutes = require("./routes/authRoutes");
const userRoutes = require("./routes/userRoutes.js");
const skillRoutes = require("./routes/skillRoutes.js");
const matchRoutes = require("./routes/matchRoutes.js");
const reviewRoutes = require("./routes/reviewRoutes.js");
const messageRoutes = require("./routes/messageRoutes.js")


const app = express();



app.use(cors());
app.use(express.json());

app.use("/api/auth", authRoutes);
app.use("/api/users", userRoutes);
app.use("/api/skills", skillRoutes);
app.use("/api/matches", matchRoutes)
app.use("/api/reviews", reviewRoutes)
app.use("/api/messages", messageRoutes)



const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
