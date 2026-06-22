const Hackathon = require('../models/Hackathon');
const Task = require('../models/Task');
const Notification = require('../models/Notification');
const CalendarEvent = require('../models/CalendarEvent');

const getDashboardStats = async (req, res) => {
  try {
    const activeHackathons = await Hackathon.countDocuments({
      isArchived: false,
      status: { $nin: ['completed', 'won'] },
    });

    const now = new Date();
    const upcomingDeadlines = await Task.countDocuments({
      deadline: { $gt: now },
    });

    const pendingTasks = await Task.countDocuments({
      status: { $in: ['backlog', 'todo', 'in_progress'] },
    });

    const oneWeekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    const tasksCompletedThisWeek = await Task.countDocuments({
      status: 'done',
      updatedAt: { $gte: oneWeekAgo },
    });

    const recentActivity = await Notification.find()
      .sort({ createdAt: -1 })
      .limit(10);

    const calendarEvents = await CalendarEvent.find({
      startDate: { $gte: now },
    })
      .sort({ startDate: 1 })
      .limit(5);

    const teamProgress = await Task.aggregate([
      {
        $group: {
          _id: '$status',
          count: { $sum: 1 },
        },
      },
    ]);

    res.json({
      activeHackathons,
      upcomingDeadlines,
      pendingTasks,
      tasksCompletedThisWeek,
      recentActivity,
      calendarEvents,
      teamProgress,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const getAnalytics = async (req, res) => {
  try {
    const totalHackathons = await Hackathon.countDocuments();
    const hackathonsWon = await Hackathon.countDocuments({ status: 'won' });
    const winRate = totalHackathons > 0 ? (hackathonsWon / totalHackathons) * 100 : 0;

    const totalTasks = await Task.countDocuments();
    const completedTasks = await Task.countDocuments({ status: 'done' });

    const tasksByUser = await Task.aggregate([
      {
        $group: {
          _id: '$assignee',
          backlog: { $sum: { $cond: [{ $eq: ['$status', 'backlog'] }, 1, 0] } },
          todo: { $sum: { $cond: [{ $eq: ['$status', 'todo'] }, 1, 0] } },
          in_progress: { $sum: { $cond: [{ $eq: ['$status', 'in_progress'] }, 1, 0] } },
          review: { $sum: { $cond: [{ $eq: ['$status', 'review'] }, 1, 0] } },
          done: { $sum: { $cond: [{ $eq: ['$status', 'done'] }, 1, 0] } },
        },
      },
      {
        $lookup: {
          from: 'users',
          localField: '_id',
          foreignField: '_id',
          as: 'user',
        },
      },
      {
        $unwind: { path: '$user', preserveNullAndEmptyArrays: true },
      },
      {
        $project: {
          'user.name': 1,
          'user.email': 1,
          backlog: 1,
          todo: 1,
          in_progress: 1,
          review: 1,
          done: 1,
        },
      },
    ]);

    const sixMonthsAgo = new Date();
    sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);

    const monthlyTrends = await Task.aggregate([
      {
        $match: { createdAt: { $gte: sixMonthsAgo } },
      },
      {
        $group: {
          _id: {
            year: { $year: '$createdAt' },
            month: { $month: '$createdAt' },
          },
          count: { $sum: 1 },
        },
      },
      { $sort: { '_id.year': 1, '_id.month': 1 } },
    ]);

    res.json({
      totalHackathons,
      hackathonsWon,
      winRate: Math.round(winRate * 100) / 100,
      totalTasks,
      completedTasks,
      tasksByUser,
      monthlyTrends,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const getTeamActivity = async (req, res) => {
  try {
    const tasks = await Task.find()
      .sort({ updatedAt: -1 })
      .limit(20)
      .populate('assignee', 'name email')
      .populate('hackathon', 'name');

    res.json(tasks);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = { getDashboardStats, getAnalytics, getTeamActivity };
