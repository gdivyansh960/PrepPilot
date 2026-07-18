const Problem = require("../models/Problem");
const Topic = require("../models/Topic");

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
            upcomingTasks,
            revisionCount,
            recentSolvedProblems,
            recentUpdatedTopics
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
            Topic.find({
                user: req.user._id,
                revisionDate: { $gte: startOfToday, $lte: upcomingDeadline }
            }).select("name revisionDate progress difficulty").sort({ revisionDate: 1 }),
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
                .limit(5)
        ]);

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
