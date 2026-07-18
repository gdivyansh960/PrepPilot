const mongoose = require("mongoose");

const interviewSchema = new mongoose.Schema(
    {
        user: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true,
            index: true
        },
        company: {
            type: String,
            required: true,
            trim: true
        },
        role: {
            type: String,
            required: true,
            trim: true
        },
        scheduledAt: Date,
        status: {
            type: String,
            default: "scheduled"
        }
    },
    {
        timestamps: true
    }
);

module.exports = mongoose.model("Interview", interviewSchema);
