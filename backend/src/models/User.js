const mongoose = require("mongoose");

// Defines the user data stored for authentication and profile features.
const userSchema = new mongoose.Schema(
    {
        name: {
            type: String,
            trim: true
        },
        email: {
            type: String,
            unique: true,
            lowercase: true,
            trim: true
        },
        password: String,
        role: {
            type: String,
            default: "student"
        },
        dailyGoal: {
            type: Number,
            min: 1,
            default: 3
        }
    },
    {
        timestamps: true
    }
);

module.exports = mongoose.model("User", userSchema);
