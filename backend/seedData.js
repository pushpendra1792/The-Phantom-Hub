require('dotenv').config();
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const connectDB = require('./config/db');

const User = require('./models/User');
const Hackathon = require('./models/Hackathon');
const Idea = require('./models/Idea');
const Task = require('./models/Task');
const Resource = require('./models/Resource');
const CalendarEvent = require('./models/CalendarEvent');
const Note = require('./models/Note');
const Notification = require('./models/Notification');

const seed = async () => {
  if (!process.argv.includes('--force')) {
    console.log('WARNING: This will DELETE ALL existing data and replace it with demo data.');
    console.log('Run with --force flag to confirm: node seedData.js --force');
    await mongoose.connection.close();
    process.exit(0);
  }

  await connectDB();

  await Promise.all([
    User.deleteMany({}),
    Hackathon.deleteMany({}),
    Idea.deleteMany({}),
    Task.deleteMany({}),
    Resource.deleteMany({}),
    CalendarEvent.deleteMany({}),
    Note.deleteMany({}),
    Notification.deleteMany({}),
  ]);

  const salt = await bcrypt.genSalt(10);
  const hashedPassword = await bcrypt.hash('password123', salt);

  const alex = await User.create({
    name: 'Alex Chen',
    email: 'alex@phantoms.dev',
    password: 'password123',
    avatar: 'https://api.dicebear.com/7.x/bottts/svg?seed=Alex',
    skills: ['React', 'Node.js', 'MongoDB', 'TypeScript', 'GraphQL'],
    github: 'https://github.com/alexchen',
    linkedin: 'https://linkedin.com/in/alexchen',
  });

  const maya = await User.create({
    name: 'Maya Patel',
    email: 'maya@phantoms.dev',
    password: 'password123',
    avatar: 'https://api.dicebear.com/7.x/bottts/svg?seed=Maya',
    skills: ['UI/UX Design', 'Figma', 'CSS', 'Tailwind', 'Animation'],
    github: 'https://github.com/mayapatel',
    linkedin: 'https://linkedin.com/in/mayapatel',
  });

  const jordan = await User.create({
    name: 'Jordan Kim',
    email: 'jordan@phantoms.dev',
    password: 'password123',
    avatar: 'https://api.dicebear.com/7.x/bottts/svg?seed=Jordan',
    skills: ['Python', 'Machine Learning', 'Data Science', 'AWS', 'Docker'],
    github: 'https://github.com/jordankim',
    linkedin: 'https://linkedin.com/in/jordankim',
  });

  const sarah = await User.create({
    name: 'Sarah Williams',
    email: 'sarah@phantoms.dev',
    password: "password123",
    avatar: 'https://api.dicebear.com/7.x/bottts/svg?seed=Sarah',
    skills: ['Mobile Dev', 'React Native', 'Swift', 'Firebase', 'Flutter'],
    github: 'https://github.com/sarahwilliams',
    linkedin: 'https://linkedin.com/in/sarahwilliams',
  });

  const codestorm = await Hackathon.create({
    name: 'CodeStorm 2024',
    status: 'building',
    organizer: 'DevPost',
    website: 'https://codestorm.devpost.com',
    registrationDeadline: new Date('2024-02-01'),
    startDate: new Date('2024-03-01'),
    endDate: new Date('2024-03-03'),
    submissionDeadline: new Date('2024-03-03'),
    theme: 'AI for Social Good',
    githubRepo: 'https://github.com/phantoms/codestorm-2024',
    figmaLink: 'https://figma.com/file/codestorm',
    description: 'Building an AI-powered platform...',
    createdBy: alex._id,
  });

  const hackmit = await Hackathon.create({
    name: 'HackMIT 2024',
    status: 'planning',
    organizer: 'MIT',
    website: 'https://hackmit.org',
    registrationDeadline: new Date('2024-04-15'),
    startDate: new Date('2024-05-01'),
    endDate: new Date('2024-05-03'),
    submissionDeadline: new Date('2024-05-03'),
    theme: 'Education Technology',
    githubRepo: '',
    figmaLink: '',
    description: 'Planning stage for HackMIT 2024',
    createdBy: maya._id,
  });

  const devhacks = await Hackathon.create({
    name: 'DevHacks 2024',
    status: 'submitted',
    organizer: 'DevHacks',
    website: 'https://devhacks.io',
    registrationDeadline: new Date('2024-01-10'),
    startDate: new Date('2024-01-20'),
    endDate: new Date('2024-01-22'),
    submissionDeadline: new Date('2024-01-22'),
    theme: 'Open Innovation',
    githubRepo: 'https://github.com/phantoms/devhacks-2024',
    figmaLink: '',
    description: 'Built a marketplace platform for local artisans',
    createdBy: jordan._id,
  });

  const codestormIdea1 = await Idea.create({
    hackathon: codestorm._id,
    title: 'AI-Powered Mental Health Companion',
    description: 'An intelligent chatbot that provides mental health support using NLP and sentiment analysis, connecting users with professional resources when needed.',
    researchLinks: ['https://example.com/mental-health-ai'],
    references: ['https://arxiv.org/abs/example'],
    votes: [
      { user: alex._id },
      { user: maya._id },
      { user: jordan._id },
    ],
    votesCount: 3,
    isSelected: true,
    comments: [
      { user: maya._id, text: 'This is exactly what we should build!' },
      { user: jordan._id, text: 'I can handle the ML model for sentiment analysis.' },
    ],
    createdBy: alex._id,
  });

  const codestormIdea2 = await Idea.create({
    hackathon: codestorm._id,
    title: 'Smart Waste Management System',
    description: 'IoT-based waste monitoring system that optimizes collection routes using real-time data and machine learning predictions.',
    researchLinks: ['https://example.com/smart-waste'],
    references: [],
    votes: [
      { user: sarah._id },
    ],
    votesCount: 1,
    isSelected: false,
    comments: [
      { user: alex._id, text: 'Great idea but might be too complex for the timeframe.' },
    ],
    createdBy: jordan._id,
  });

  const hackmitIdea1 = await Idea.create({
    hackathon: hackmit._id,
    title: 'Personalized Learning Platform',
    description: 'An adaptive learning platform that uses AI to create personalized study paths based on student performance and learning style.',
    researchLinks: ['https://example.com/personalized-learning'],
    references: ['https://example.com/edtech-research'],
    votes: [
      { user: maya._id },
      { user: alex._id },
    ],
    votesCount: 2,
    isSelected: true,
    comments: [
      { user: alex._id, text: 'We should focus on the recommendation engine.' },
      { user: maya._id, text: 'I already have some wireframes for this.' },
    ],
    createdBy: maya._id,
  });

  const hackmitIdea2 = await Idea.create({
    hackathon: hackmit._id,
    title: 'Virtual Classroom with AR',
    description: 'An augmented reality classroom experience that makes remote learning more interactive and engaging for students.',
    researchLinks: [],
    references: [],
    votes: [
      { user: sarah._id },
      { user: jordan._id },
    ],
    votesCount: 2,
    isSelected: false,
    comments: [],
    createdBy: sarah._id,
  });

  const devhacksIdea1 = await Idea.create({
    hackathon: devhacks._id,
    title: 'Artisan Marketplace Platform',
    description: 'A peer-to-peer marketplace connecting local artisans with customers, featuring secure payments, reviews, and delivery tracking.',
    researchLinks: ['https://example.com/artisan-market'],
    references: ['https://example.com/marketplace-research'],
    votes: [
      { user: jordan._id },
      { user: maya._id },
      { user: alex._id },
      { user: sarah._id },
    ],
    votesCount: 4,
    isSelected: true,
    comments: [
      { user: maya._id, text: 'The UI needs to feel artisanal and warm.' },
      { user: alex._id, text: 'I can build the payment integration.' },
      { user: sarah._id, text: 'Need to make it mobile-first.' },
    ],
    createdBy: jordan._id,
  });

  const devhacksIdea2 = await Idea.create({
    hackathon: devhacks._id,
    title: 'Skill Swap Community',
    description: 'A platform where people can trade skills and knowledge through video sessions, project collaborations, and mentorship.',
    researchLinks: [],
    references: [],
    votes: [
      { user: alex._id },
    ],
    votesCount: 1,
    isSelected: false,
    comments: [
      { user: jordan._id, text: 'Interesting concept but let\'s keep it for the next hackathon.' },
    ],
    createdBy: maya._id,
  });

  codestorm.selectedIdea = codestormIdea1._id;
  hackmit.selectedIdea = hackmitIdea1._id;
  devhacks.selectedIdea = devhacksIdea1._id;
  await Promise.all([codestorm.save(), hackmit.save(), devhacks.save()]);

  await Task.insertMany([
    {
      hackathon: codestorm._id,
      title: 'Set up React frontend with Tailwind',
      description: 'Initialize the React project and configure Tailwind CSS with the team\'s design system.',
      status: 'todo',
      priority: 'medium',
      assignee: alex._id,
      deadline: new Date('2026-06-25'),
      labels: ['frontend', 'setup'],
      comments: [
        { user: maya._id, text: 'I\'ll share the color palette and design tokens.' },
      ],
      createdBy: alex._id,
    },
    {
      hackathon: codestorm._id,
      title: 'Design database schema',
      description: 'Create MongoDB schemas for users, projects, and submissions.',
      status: 'in_progress',
      priority: 'high',
      assignee: alex._id,
      labels: ['backend', 'database'],
      createdBy: alex._id,
    },
    {
      hackathon: codestorm._id,
      title: 'Implement authentication system',
      description: 'Set up JWT-based auth with email/password and OAuth providers.',
      status: 'in_progress',
      priority: 'urgent',
      assignee: jordan._id,
      deadline: new Date('2026-06-28'),
      labels: ['backend', 'auth', 'security'],
      comments: [
        { user: alex._id, text: 'Make sure to add refresh token rotation.' },
      ],
      createdBy: jordan._id,
    },
    {
      hackathon: codestorm._id,
      title: 'Build REST API endpoints',
      description: 'Create all CRUD endpoints for the core resources.',
      status: 'backlog',
      priority: 'medium',
      assignee: sarah._id,
      labels: ['backend', 'api'],
      createdBy: sarah._id,
    },
    {
      hackathon: codestorm._id,
      title: 'Create UI component library',
      description: 'Build reusable components: buttons, modals, forms, cards.',
      status: 'todo',
      priority: 'low',
      assignee: maya._id,
      labels: ['frontend', 'ui', 'design'],
      createdBy: maya._id,
    },
    {
      hackathon: codestorm._id,
      title: 'Write unit tests',
      description: 'Achieve 80% test coverage for backend services.',
      status: 'done',
      priority: 'medium',
      assignee: alex._id,
      labels: ['testing', 'quality'],
      createdBy: alex._id,
    },
    {
      hackathon: codestorm._id,
      title: 'Configure CI/CD pipeline',
      description: 'Set up GitHub Actions for automated testing and deployment.',
      status: 'review',
      priority: 'high',
      assignee: jordan._id,
      deadline: new Date('2026-07-02'),
      labels: ['devops', 'deployment'],
      createdBy: jordan._id,
    },
    {
      hackathon: hackmit._id,
      title: 'Conduct user research',
      description: 'Interview 10 students and teachers about their pain points with current EdTech tools.',
      status: 'todo',
      priority: 'medium',
      assignee: maya._id,
      deadline: new Date('2026-07-05'),
      labels: ['research', 'design'],
      createdBy: maya._id,
    },
    {
      hackathon: hackmit._id,
      title: 'Synthesize user interview findings',
      description: 'Analyze interview data and create affinity maps and user personas.',
      status: 'in_progress',
      priority: 'high',
      assignee: maya._id,
      labels: ['research', 'design'],
      createdBy: maya._id,
    },
    {
      hackathon: hackmit._id,
      title: 'Design wireframes',
      description: 'Create low-fidelity wireframes for the main user flows.',
      status: 'todo',
      priority: 'medium',
      assignee: maya._id,
      labels: ['design', 'ux'],
      createdBy: maya._id,
    },
    {
      hackathon: hackmit._id,
      title: 'Evaluate tech stack options',
      description: 'Compare React vs Vue, Node vs Python for backend, and database options.',
      status: 'backlog',
      priority: 'low',
      assignee: alex._id,
      labels: ['architecture', 'decision'],
      createdBy: alex._id,
    },
    {
      hackathon: hackmit._id,
      title: 'Write project proposal',
      description: 'Draft the HackMIT project proposal document.',
      status: 'done',
      priority: 'high',
      assignee: jordan._id,
      labels: ['documentation', 'planning'],
      createdBy: jordan._id,
    },
    {
      hackathon: hackmit._id,
      title: 'Create budget plan',
      description: 'Estimate costs for APIs, hosting, and tools needed for the project.',
      status: 'review',
      priority: 'medium',
      assignee: sarah._id,
      deadline: new Date('2026-07-10'),
      labels: ['planning', 'budget'],
      createdBy: sarah._id,
    },
    {
      hackathon: hackmit._id,
      title: 'Define team roles',
      description: 'Assign roles and responsibilities for each team member.',
      status: 'done',
      priority: 'low',
      assignee: sarah._id,
      labels: ['management', 'planning'],
      createdBy: sarah._id,
    },
    {
      hackathon: devhacks._id,
      title: 'Fix production bugs',
      description: 'Resolve critical bugs reported in the marketplace platform.',
      status: 'in_progress',
      priority: 'urgent',
      assignee: alex._id,
      deadline: new Date('2026-06-22'),
      labels: ['bug', 'production'],
      comments: [
        { user: jordan._id, text: 'The payment gateway timeout needs immediate attention.' },
      ],
      createdBy: alex._id,
    },
    {
      hackathon: devhacks._id,
      title: 'Write project documentation',
      description: 'Create comprehensive README, API docs, and setup guide.',
      status: 'todo',
      priority: 'medium',
      assignee: sarah._id,
      labels: ['documentation'],
      createdBy: sarah._id,
    },
    {
      hackathon: devhacks._id,
      title: 'Record demo video',
      description: 'Create a 3-minute demo video showcasing the platform features.',
      status: 'backlog',
      priority: 'low',
      assignee: maya._id,
      labels: ['demo', 'media'],
      createdBy: maya._id,
    },
    {
      hackathon: devhacks._id,
      title: 'Prepare final presentation',
      description: 'Create slides and talking points for the judging presentation.',
      status: 'review',
      priority: 'high',
      assignee: jordan._id,
      labels: ['presentation', 'preparation'],
      createdBy: jordan._id,
    },
    {
      hackathon: devhacks._id,
      title: 'Refactor codebase',
      description: 'Clean up code, remove dead code, and standardize patterns.',
      status: 'done',
      priority: 'medium',
      assignee: alex._id,
      labels: ['refactoring', 'quality'],
      createdBy: alex._id,
    },
    {
      hackathon: devhacks._id,
      title: 'Fill submission form',
      description: 'Complete the DevHacks submission form with project details and links.',
      status: 'todo',
      priority: 'high',
      assignee: jordan._id,
      deadline: new Date('2026-06-24'),
      labels: ['submission', 'admin'],
      createdBy: jordan._id,
    },
  ]);

  await Resource.insertMany([
    {
      hackathon: codestorm._id,
      name: 'API Design Best Practices',
      type: 'pdf',
      fileUrl: '/uploads/api-design-guide.pdf',
      fileSize: 2450000,
      uploadedBy: alex._id,
      description: 'Comprehensive guide to designing RESTful APIs with examples.',
    },
    {
      hackathon: codestorm._id,
      name: 'Project Setup Guide',
      type: 'documentation',
      fileUrl: '/uploads/setup-guide.md',
      fileSize: 12000,
      uploadedBy: alex._id,
      description: 'Step-by-step guide to setting up the development environment.',
    },
    {
      hackathon: hackmit._id,
      name: 'User Research Report',
      type: 'research',
      fileUrl: '/uploads/user-research.pdf',
      fileSize: 3800000,
      uploadedBy: maya._id,
      description: 'Findings from user interviews with students and teachers.',
    },
    {
      hackathon: hackmit._id,
      name: 'Wireframe Mockups',
      type: 'ui',
      fileUrl: '/uploads/wireframes.fig',
      fileSize: 890000,
      uploadedBy: maya._id,
      description: 'Figma wireframes for the main application screens.',
    },
    {
      hackathon: devhacks._id,
      name: 'Platform Screenshots',
      type: 'image',
      fileUrl: '/uploads/screenshots.zip',
      fileSize: 12000000,
      uploadedBy: jordan._id,
      description: 'Screenshots of the completed marketplace platform.',
    },
  ]);

  await CalendarEvent.insertMany([
    {
      title: 'Sprint Planning',
      description: 'Plan tasks for the upcoming sprint.',
      startDate: new Date('2026-06-22T09:00:00'),
      endDate: new Date('2026-06-22T10:00:00'),
      type: 'meeting',
      createdBy: alex._id,
      color: '#3b82f6',
    },
    {
      title: 'CodeStorm Demo Day',
      description: 'Final demo presentation for CodeStorm.',
      startDate: new Date('2026-06-26T14:00:00'),
      endDate: new Date('2026-06-26T16:00:00'),
      type: 'hackathon',
      hackathon: codestorm._id,
      createdBy: alex._id,
      color: '#a855f7',
    },
    {
      title: 'CodeStorm Submission Deadline',
      description: 'Final submission deadline for CodeStorm project.',
      startDate: new Date('2026-06-28T23:59:00'),
      endDate: new Date('2026-06-29T00:00:00'),
      type: 'deadline',
      hackathon: codestorm._id,
      createdBy: jordan._id,
      color: '#ef4444',
    },
    {
      title: 'Team Retrospective',
      description: 'Reflect on the sprint and identify improvements.',
      startDate: new Date('2026-06-30T15:00:00'),
      endDate: new Date('2026-06-30T16:00:00'),
      type: 'meeting',
      createdBy: maya._id,
      color: '#22c55e',
    },
    {
      title: 'HackMIT Kickoff',
      description: 'Official kickoff meeting for HackMIT project.',
      startDate: new Date('2026-07-03T10:00:00'),
      endDate: new Date('2026-07-03T12:00:00'),
      type: 'milestone',
      hackathon: hackmit._id,
      createdBy: maya._id,
      color: '#f59e0b',
    },
    {
      title: 'Design Review Session',
      description: 'Review wireframes and prototypes for HackMIT.',
      startDate: new Date('2026-07-08T14:00:00'),
      endDate: new Date('2026-07-08T15:30:00'),
      type: 'meeting',
      hackathon: hackmit._id,
      createdBy: maya._id,
      color: '#8b5cf6',
    },
    {
      title: 'HackMIT Proposal Deadline',
      description: 'Submit project proposal for HackMIT.',
      startDate: new Date('2026-07-12T23:59:00'),
      endDate: new Date('2026-07-13T00:00:00'),
      type: 'deadline',
      hackathon: hackmit._id,
      createdBy: jordan._id,
      color: '#ef4444',
    },
    {
      title: 'Team Building Outing',
      description: 'Team outing to build camaraderie.',
      startDate: new Date('2026-07-15T11:00:00'),
      endDate: new Date('2026-07-15T17:00:00'),
      type: 'other',
      createdBy: sarah._id,
      color: '#ec4899',
    },
  ]);

  await Note.insertMany([
    {
      hackathon: codestorm._id,
      title: 'Sprint Planning Meeting Notes',
      content: 'Decided to focus on core features first. AI model integration pushed to next sprint. Assigned tasks to team members.',
      type: 'meeting_minutes',
      tags: ['sprint', 'planning'],
      createdBy: alex._id,
    },
    {
      hackathon: codestorm._id,
      title: 'Tech Stack Decision Log',
      content: 'MERN stack confirmed. Using TensorFlow.js for client-side AI. Deploying on Vercel + MongoDB Atlas.',
      type: 'decision',
      tags: ['tech-stack', 'architecture'],
      createdBy: alex._id,
    },
    {
      hackathon: hackmit._id,
      title: 'HackMIT Project Plan',
      content: 'Phase 1: Research and UX (2 weeks). Phase 2: Development (4 weeks). Phase 3: Testing and Deployment (2 weeks).',
      type: 'planning',
      tags: ['planning', 'timeline'],
      createdBy: maya._id,
    },
    {
      hackathon: devhacks._id,
      title: 'DevHacks Retrospective',
      content: 'Strengths: Great teamwork, on-time delivery. Improvements: Need better time estimation, more automated testing.',
      type: 'retrospective',
      tags: ['retro', 'reflection'],
      createdBy: jordan._id,
    },
    {
      title: 'Team Knowledge Base Ideas',
      content: 'Create a shared Notion workspace for documentation. Set up weekly knowledge-sharing sessions on Fridays.',
      type: 'general',
      tags: ['wiki', 'knowledge'],
      createdBy: sarah._id,
    },
    {
      title: 'Weekly Standup Notes',
      content: 'Alex: Working on API. Maya: Finishing wireframes. Jordan: ML model training. Sarah: Documentation updates.',
      type: 'meeting_minutes',
      tags: ['standup', 'weekly'],
      createdBy: alex._id,
    },
  ]);

  const tasks = await Task.find({}, '_id title hackathon');

  await Notification.insertMany([
    {
      user: alex._id,
      title: 'Task Assigned',
      message: 'You have been assigned "Set up React frontend with Tailwind"',
      type: 'task',
      relatedTo: { model: 'Task', id: tasks[0]._id },
      isRead: false,
    },
    {
      user: jordan._id,
      title: 'Task Assigned',
      message: 'You have been assigned "Implement authentication system"',
      type: 'task',
      relatedTo: { model: 'Task', id: tasks[2]._id },
      isRead: false,
    },
    {
      user: alex._id,
      title: 'Upcoming Deadline',
      message: '"Set up React frontend with Tailwind" is due on June 25',
      type: 'deadline',
      relatedTo: { model: 'Task', id: tasks[0]._id },
      isRead: false,
    },
    {
      user: maya._id,
      title: 'New Comment',
      message: 'Alex commented on "Set up React frontend with Tailwind": I\'ll share the color palette and design tokens.',
      type: 'comment',
      relatedTo: { model: 'Task', id: tasks[0]._id },
      isRead: true,
    },
    {
      user: alex._id,
      title: 'New Comment',
      message: 'Jordan commented on "Fix production bugs": The payment gateway timeout needs immediate attention.',
      type: 'comment',
      relatedTo: { model: 'Task', id: tasks[14]._id },
      isRead: false,
    },
    {
      user: jordan._id,
      title: 'Upcoming Deadline',
      message: '"Implement authentication system" is due on June 28',
      type: 'deadline',
      relatedTo: { model: 'Task', id: tasks[2]._id },
      isRead: false,
    },
    {
      user: sarah._id,
      title: 'Task Assigned',
      message: 'You have been assigned "Write project documentation"',
      type: 'task',
      relatedTo: { model: 'Task', id: tasks[15]._id },
      isRead: false,
    },
    {
      user: maya._id,
      title: 'Hackathon Update',
      message: 'HackMIT project planning phase has started. Check the new tasks.',
      type: 'hackathon',
      relatedTo: { model: 'Hackathon', id: hackmit._id },
      isRead: false,
    },
    {
      user: jordan._id,
      title: 'Submission Reminder',
      message: 'DevHacks submission form needs to be filled by June 24.',
      type: 'deadline',
      relatedTo: { model: 'Task', id: tasks[19]._id },
      isRead: false,
    },
    {
      user: alex._id,
      title: 'New Resource Uploaded',
      message: 'Jordan uploaded "Platform Screenshots" to DevHacks.',
      type: 'upload',
      relatedTo: { model: 'Resource', id: null },
      isRead: true,
    },
  ]);

  console.log('Seed data inserted successfully!');
  await mongoose.connection.close();
  process.exit(0);
};

seed().catch((err) => {
  console.error('Seed error:', err);
  process.exit(1);
});
