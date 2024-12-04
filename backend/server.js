const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const dotenv = require("dotenv");

// Load environment variables from .env file
dotenv.config();

// Initialize Express app
const app = express();

// Middleware setup
app.use(cors());
app.use(express.json()); // To parse incoming JSON requests

// Database connection using MongoDB URI from environment variables
mongoose.connect(process.env.MONGO_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
})
    .then(() => console.log("Connected to MongoDB"))
    .catch((err) => console.log("MongoDB connection error:", err));

// Importing Routes
const authRoutes = require("./routes/authRoutes");

// Use routes for handling authentication, user, and driver related requests
app.use("/api/auth", authRoutes);

// Start the server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
