const express = require("express");

const app = express();

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

module.exports = app;
