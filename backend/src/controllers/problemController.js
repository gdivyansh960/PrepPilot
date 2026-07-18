const Problem = require("../models/Problem");
const Topic = require("../models/Topic");

const findOwnedTopic = (topicId, userId) => {
    return Topic.findOne({ _id: topicId, user: userId });
};

const syncTopicProblemCount = async (topicId, userId) => {
    const solvedCount = await Problem.countDocuments({
        user: userId,
        topic: topicId,
        status: "solved"
    });

    await Topic.updateOne(
        { _id: topicId, user: userId },
        { problemsSolved: solvedCount }
    );
};

const getProblems = async (req, res, next) => {
    try {
        const filters = { user: req.user._id };
        const { topic, status, platform, difficulty } = req.query;

        if (topic) filters.topic = topic;
        if (status) filters.status = status;
        if (platform) filters.platform = platform;
        if (difficulty) filters.difficulty = difficulty;

        const problems = await Problem.find(filters)
            .populate("topic", "name")
            .sort({ updatedAt: -1 });

        return res.status(200).json({
            success: true,
            problems
        });
    } catch (error) {
        next(error);
    }
};

const createProblem = async (req, res, next) => {
    try {
        const topic = await findOwnedTopic(req.body.topic, req.user._id);

        if (!topic) {
            return res.status(404).json({
                success: false,
                message: "Topic not found"
            });
        }

        const problem = await Problem.create({
            ...req.body,
            title: req.body.title.trim(),
            user: req.user._id,
            solvedAt: req.body.status === "solved" ? new Date() : undefined
        });

        await syncTopicProblemCount(problem.topic, req.user._id);

        return res.status(201).json({
            success: true,
            message: "Problem created successfully",
            problem
        });
    } catch (error) {
        next(error);
    }
};

const updateProblem = async (req, res, next) => {
    try {
        const problem = await Problem.findOne({ _id: req.params.id, user: req.user._id });

        if (!problem) {
            return res.status(404).json({
                success: false,
                message: "Problem not found"
            });
        }

        const previousTopicId = problem.topic.toString();

        if (req.body.topic !== undefined) {
            const topic = await findOwnedTopic(req.body.topic, req.user._id);

            if (!topic) {
                return res.status(404).json({
                    success: false,
                    message: "Topic not found"
                });
            }

            problem.topic = req.body.topic;
        }

        ["title", "platform", "difficulty", "link", "notes", "markedForRevision"].forEach((field) => {
            if (req.body[field] !== undefined) {
                problem[field] = field === "title" ? req.body[field].trim() : req.body[field];
            }
        });

        if (req.body.status !== undefined) {
            const wasSolved = problem.status === "solved";
            problem.status = req.body.status;

            if (problem.status === "solved" && !wasSolved) {
                problem.solvedAt = new Date();
            }

            if (problem.status !== "solved") {
                problem.solvedAt = undefined;
            }
        }

        const updatedProblem = await problem.save();
        const affectedTopicIds = new Set([
            previousTopicId,
            updatedProblem.topic.toString()
        ]);

        await Promise.all(
            [...affectedTopicIds].map((topicId) => syncTopicProblemCount(topicId, req.user._id))
        );

        return res.status(200).json({
            success: true,
            message: "Problem updated successfully",
            problem: updatedProblem
        });
    } catch (error) {
        next(error);
    }
};

const deleteProblem = async (req, res, next) => {
    try {
        const problem = await Problem.findOne({ _id: req.params.id, user: req.user._id });

        if (!problem) {
            return res.status(404).json({
                success: false,
                message: "Problem not found"
            });
        }

        await problem.deleteOne();
        await syncTopicProblemCount(problem.topic, req.user._id);

        return res.status(200).json({
            success: true,
            message: "Problem deleted successfully"
        });
    } catch (error) {
        next(error);
    }
};

module.exports = {
    getProblems,
    createProblem,
    updateProblem,
    deleteProblem
};
