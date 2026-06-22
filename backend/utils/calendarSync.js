const CalendarEvent = require('../models/CalendarEvent');
const Task = require('../models/Task');
const Hackathon = require('../models/Hackathon');

const EVENT_COLORS = {
  deadline: '#ef4444',
  hackathon: '#a855f7',
  meeting: '#22c55e',
  milestone: '#f59e0b',
  round: '#3b82f6',
};

async function upsertEvent({ title, description, startDate, endDate, type, hackathonId, createdBy, sourceId, sourceType, color }) {
  const filter = { sourceId, sourceType };
  if (sourceType === 'hackathon' && !sourceId) {
    return null;
  }
  const update = {
    title,
    description,
    startDate,
    endDate,
    type,
    hackathon: hackathonId || null,
    createdBy: createdBy || null,
    sourceId,
    sourceType,
    color: color || EVENT_COLORS[type] || '#a855f7',
  };

  const existing = await CalendarEvent.findOne(filter);
  if (existing) {
    const updated = await CalendarEvent.findByIdAndUpdate(existing._id, update, { new: true });
    return updated;
  }
  const created = await CalendarEvent.create(update);
  return created;
}

async function removeEvents(sourceId, sourceType) {
  if (!sourceId) return;
  await CalendarEvent.deleteMany({ sourceId, sourceType });
}

async function syncTaskEvents(task) {
  if (!task || !task._id) return;
  const filter = { sourceId: task._id, sourceType: 'task' };
  if (task.deadline) {
    const title = `Task Deadline: ${task.title}`;
    const endDate = new Date(task.deadline);
    const startDate = new Date(endDate);
    startDate.setHours(startDate.getHours() - 1);
    await upsertEvent({
      title,
      description: task.description || '',
      startDate,
      endDate,
      type: 'deadline',
      hackathonId: task.hackathon,
      createdBy: task.createdBy,
      sourceId: task._id,
      sourceType: 'task',
    });
  } else {
    await CalendarEvent.deleteMany(filter);
  }
}

async function removeTaskEvents(taskId) {
  await removeEvents(taskId, 'task');
}

async function syncHackathonEvents(hackathon) {
  if (!hackathon || !hackathon._id) return;

  const hackathonId = hackathon._id;
  const createdBy = hackathon.createdBy;

  const existingEvents = await CalendarEvent.find({
    sourceId: hackathonId,
    sourceType: { $in: ['hackathon', 'round', 'meeting'] },
  });

  const eventsToKeep = [];

  if (hackathon.registrationDeadline) {
    const title = `Registration Deadline: ${hackathon.name}`;
    const endDate = new Date(hackathon.registrationDeadline);
    const startDate = new Date(endDate);
    startDate.setHours(startDate.getHours() - 1);
    const ev = await upsertEvent({ title, description: 'Registration deadline', startDate, endDate, type: 'deadline', hackathonId, createdBy, sourceId: hackathonId, sourceType: 'hackathon', color: EVENT_COLORS.deadline });
    if (ev) eventsToKeep.push(ev._id.toString());
  }

  if (hackathon.startDate) {
    const title = `Start: ${hackathon.name}`;
    const startDate = new Date(hackathon.startDate);
    const endDate = new Date(startDate);
    endDate.setHours(endDate.getHours() + 2);
    const ev = await upsertEvent({ title, description: 'Hackathon starts', startDate, endDate, type: 'hackathon', hackathonId, createdBy, sourceId: hackathonId, sourceType: 'hackathon', color: EVENT_COLORS.hackathon });
    if (ev) eventsToKeep.push(ev._id.toString());
  }

  if (hackathon.endDate) {
    const title = `End: ${hackathon.name}`;
    const endDate = new Date(hackathon.endDate);
    const startDate = new Date(endDate);
    startDate.setHours(startDate.getHours() - 2);
    const ev = await upsertEvent({ title, description: 'Hackathon ends', startDate, endDate, type: 'hackathon', hackathonId, createdBy, sourceId: hackathonId, sourceType: 'hackathon', color: EVENT_COLORS.hackathon });
    if (ev) eventsToKeep.push(ev._id.toString());
  }

  if (hackathon.submissionDeadline) {
    const title = `Submission Deadline: ${hackathon.name}`;
    const endDate = new Date(hackathon.submissionDeadline);
    const startDate = new Date(endDate);
    startDate.setHours(startDate.getHours() - 1);
    const ev = await upsertEvent({ title, description: 'Submission deadline', startDate, endDate, type: 'deadline', hackathonId, createdBy, sourceId: hackathonId, sourceType: 'hackathon', color: EVENT_COLORS.deadline });
    if (ev) eventsToKeep.push(ev._id.toString());
  }

  if (hackathon.rounds && hackathon.rounds.length > 0) {
    for (const round of hackathon.rounds) {
      if (!round._id) continue;
      const title = `Round: ${hackathon.name} - ${round.name}`;
      const endDate = new Date(round.date);
      const startDate = new Date(endDate);
      startDate.setHours(startDate.getHours() - 1);
      const ev = await upsertEvent({
        title,
        description: round.description || `${round.name} round for ${hackathon.name}`,
        startDate, endDate, type: 'milestone', hackathonId, createdBy,
        sourceId: hackathonId, sourceType: 'round',
        color: EVENT_COLORS.round,
      });
      if (ev) eventsToKeep.push(ev._id.toString());
    }
  }

  if (hackathon.meetings && hackathon.meetings.length > 0) {
    for (const meeting of hackathon.meetings) {
      if (!meeting._id) continue;
      const title = `Meeting: ${hackathon.name} - ${meeting.title}`;
      const endDate = new Date(meeting.date);
      const startDate = new Date(endDate);
      startDate.setHours(startDate.getHours() - 1);
      const ev = await upsertEvent({
        title,
        description: `${meeting.description || meeting.title}${meeting.location ? ` at ${meeting.location}` : ''}`,
        startDate, endDate, type: 'meeting', hackathonId, createdBy,
        sourceId: hackathonId, sourceType: 'meeting',
        color: EVENT_COLORS.meeting,
      });
      if (ev) eventsToKeep.push(ev._id.toString());
    }
  }

  const toRemove = existingEvents.filter((e) => !eventsToKeep.includes(e._id.toString()));
  if (toRemove.length > 0) {
    await CalendarEvent.deleteMany({ _id: { $in: toRemove.map((e) => e._id) } });
  }
}

async function removeHackathonEvents(hackathonId) {
  await CalendarEvent.deleteMany({
    sourceId: hackathonId,
    sourceType: { $in: ['hackathon', 'round', 'meeting'] },
  });
}

async function syncAll(userId) {
  const tasks = await Task.find({ deadline: { $ne: null } });
  for (const task of tasks) {
    const taskObj = task;
    if (!taskObj.createdBy) taskObj.createdBy = userId;
    await syncTaskEvents(taskObj);
  }

  const hackathons = await Hackathon.find({ isArchived: false });
  for (const hackathon of hackathons) {
    const hackObj = hackathon;
    if (!hackObj.createdBy) hackObj.createdBy = userId;
    await syncHackathonEvents(hackObj);
  }

  return { tasks: tasks.length, hackathons: hackathons.length };
}

module.exports = { syncTaskEvents, removeTaskEvents, syncHackathonEvents, removeHackathonEvents, syncAll };
