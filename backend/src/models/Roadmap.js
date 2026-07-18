const mongoose = require("mongoose");

const roadmapSchema = new mongoose.Schema(
    {
        user: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true,
            index: true
        },
        title: {
            type: String,
            required: true,
            trim: true
        },
        description: String,
        status: {
            type: String,
            default: "planned"
        }
    },
    {
        timestamps: true
    }
);

module.exports = mongoose.model("Roadmap", roadmapSchema);
