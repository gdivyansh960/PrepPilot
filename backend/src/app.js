const express = require("express");
const cors = require('cors');
const authRoutes = require("./routes/authRoutes");
const topicRoutes = require("./routes/topicRoutes");
const problemRoutes = require("./routes/problemRoutes");
const dashboardRoutes = require("./routes/dashboardRoutes");
const roadmapRoutes = require("./routes/roadmapRoutes");
const interviewRoutes = require("./routes/interviewRoutes");
const resumeRoutes = require("./routes/resumeRoutes");
const notificationRoutes = require("./routes/notificationRoutes");
const { notFound, errorHandler } = require("./middleware/errorMiddleware");

const app = express();

app.use(cors());
app.use(express.json());

// Mounts authentication endpoints under the API namespace.
app.use("/api/auth", authRoutes);
app.use("/api/topics", topicRoutes);
app.use("/api/problems", problemRoutes);
app.use("/api/dashboard", dashboardRoutes);
app.use("/api/roadmap", roadmapRoutes);
app.use("/api/interviews", interviewRoutes);
app.use("/api/resume", resumeRoutes);
app.use("/api/notifications", notificationRoutes);

app.get("/", (req, res) => {
    res.send("Welcome to PrepPilot Backend!");
});

app.get("/about", (req, res) => {
    res.send("PrepPilot AI - Intelligent Placement Preparation Platform");
});

app.get("/health", (req, res) => {
    res.json({
        status: "OK",
        message: "Server is running successfully"
    });
});

app.get ("/student/:id", (req, res) => {
    res.json({
        studentId: req.params.id
    });
});

app.use(notFound);
app.use(errorHandler);

module.exports = app;
