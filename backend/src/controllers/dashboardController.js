const Problem = require("../models/Problem");
const Topic = require("../models/Topic");
const Roadmap = require("../models/Roadmap");
const Notification = require("../models/Notification");

const getStartOfUtcDay = (date) => {
    return new Date(Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate()));
};

const getDateKey = (date) => date.toISOString().slice(0, 10);

const calculateCurrentStreak = (solvedProblems, today) => {
    const solvedDays = new Set(solvedProblems.map((problem) => getDateKey(problem.solvedAt)));
    const cursor = getStartOfUtcDay(today);
    let streak = 0;

    // A streak only continues while each calendar day has at least one solved problem.
    while (solvedDays.has(getDateKey(cursor))) {
        streak += 1;
        cursor.setUTCDate(cursor.getUTCDate() - 1);
    }

    return streak;
};

const getDashboardStats = async (req, res, next) => {
    try {
        const now = new Date();
        const startOfToday = getStartOfUtcDay(now);
        const startOfTomorrow = new Date(startOfToday);
        startOfTomorrow.setUTCDate(startOfTomorrow.getUTCDate() + 1);
        const upcomingDeadline = new Date(startOfToday);
        upcomingDeadline.setUTCDate(upcomingDeadline.getUTCDate() + 7);
        const endOfToday = new Date(startOfTomorrow.getTime() - 1);

        const [
            solvedProblems,
            solvedToday,
            roadmaps,
            revisionCount,
            recentSolvedProblems,
            recentUpdatedTopics,
            dueRevisionTopics
        ] = await Promise.all([
            Problem.find({
                user: req.user._id,
                status: "solved",
                solvedAt: { $exists: true }
            }).select("solvedAt"),
            Problem.countDocuments({
                user: req.user._id,
                status: "solved",
                solvedAt: { $gte: startOfToday, $lt: startOfTomorrow }
            }),
            Roadmap.find({
                user: req.user._id,
                items: { $elemMatch: { completed: false, targetDate: { $gte: startOfToday, $lte: upcomingDeadline } } }
            }).select("title type items"),
            Topic.countDocuments({
                user: req.user._id,
                revisionDate: { $exists: true, $ne: null, $lte: endOfToday }
            }),
            Problem.find({
                user: req.user._id,
                status: "solved",
                solvedAt: { $exists: true }
            }).select("title solvedAt topic").populate("topic", "name").sort({ solvedAt: -1 }).limit(5),
            Topic.find({ user: req.user._id })
                .select("name updatedAt progress")
                .sort({ updatedAt: -1 })
                .limit(5),
            Topic.find({
                user: req.user._id,
                revisionDate: { $exists: true, $ne: null, $lte: endOfToday }
            }).select("name revisionDate")
        ]);

        const upcomingTasks = roadmaps
            .flatMap((roadmap) => roadmap.items
                .filter((item) => !item.completed && item.targetDate >= startOfToday && item.targetDate <= upcomingDeadline)
                .map((item) => ({
                    _id: item._id,
                    title: item.description,
                    targetDate: item.targetDate,
                    roadmap: roadmap.title,
                    type: roadmap.type
                })))
            .sort((first, second) => first.targetDate - second.targetDate);

        await Promise.all(dueRevisionTopics.map((topic) => Notification.findOneAndUpdate(
            { user: req.user._id, type: "revision-due", topic: topic._id, dueDate: topic.revisionDate },
            {
                $setOnInsert: {
                    message: `Revision due: ${topic.name}`,
                    type: "revision-due",
                    user: req.user._id,
                    topic: topic._id,
                    dueDate: topic.revisionDate
                }
            },
            { upsert: true, new: true }
        )));

        const recentActivity = [
            ...recentSolvedProblems.map((problem) => ({
                type: "problem-solved",
                title: problem.title,
                topic: problem.topic?.name,
                occurredAt: problem.solvedAt
            })),
            ...recentUpdatedTopics.map((topic) => ({
                type: "topic-updated",
                title: topic.name,
                progress: topic.progress,
                occurredAt: topic.updatedAt
            }))
        ]
            .sort((first, second) => second.occurredAt - first.occurredAt)
            .slice(0, 5);

        const dailyGoal = req.user.dailyGoal || 3;

        return res.status(200).json({
            success: true,
            dashboard: {
                currentStreak: calculateCurrentStreak(solvedProblems, now),
                todaysGoal: {
                    target: dailyGoal,
                    solved: solvedToday,
                    remaining: Math.max(dailyGoal - solvedToday, 0)
                },
                upcomingTasks,
                revisionCount,
                recentActivity
            }
        });
    } catch (error) {
        next(error);
    }
};

module.exports = { getDashboardStats };
