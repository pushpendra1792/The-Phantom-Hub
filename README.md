# The Phantoms Hub 🚀

> A centralized hackathon operating system for **The Phantoms** — a team of 4 developers participating in multiple hackathons throughout the year.

## Overview

The Phantoms Hub is a full-stack MERN application that acts as a collaborative workspace where team members can manage hackathons, projects, deadlines, tasks, resources, and team activities from a single dashboard.

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | React 18, Vite, Tailwind CSS, React Router, Chart.js, Socket.IO Client |
| Backend | Node.js, Express.js, Socket.IO |
| Database | MongoDB with Mongoose ODM |
| Auth | JWT (JSON Web Tokens), bcrypt |
| Storage | Multer (file uploads) |
| Real-time | Socket.IO |

## Features

### Authentication
- Sign up / Login with JWT
- User profiles (avatar, skills, GitHub, LinkedIn)
- Password reset

### Dashboard
- Active hackathons overview
- Upcoming deadlines & pending tasks
- Tasks completed this week
- Recent team activity feed
- Calendar events snapshot
- Team progress charts (Doughnut chart)
- Quick actions

### Hackathon Workspace
- Create / Edit / Archive hackathons
- Status tracking (Planning → Registered → Building → Submitted → Completed → Won)
- Search and filter
- Progress indicators with countdown timers

### Idea Vault
- Brainstorm and store project ideas per hackathon
- Research links & references
- Voting system
- Comments on ideas
- Select winning idea

### Kanban Task Board
- Trello-style board: Backlog → To Do → In Progress → Review → Done
- Board and list views
- Task CRUD with priority, assignee, deadline, labels
- Comments & file attachments
- Filter by hackathon, assignee, priority, status

### Resource Repository
- Upload and organize files by hackathon (PDF, PPT, Docs, Images, ZIP, etc.)
- File type icons and size display
- Download and delete

### Deadline Center
- Registration, submission, and presentation deadlines
- Internal milestones
- Countdown timers with urgency indicators

### Calendar
- Unified view of hackathons, meetings, deadlines, milestones
- Monthly and weekly views
- Create, edit, delete events
- Color-coded event types

### Team Profiles
- View team members' skills, tasks, and contributions
- GitHub and LinkedIn links
- Task distribution by member

### Notes & Meeting Logs
- Meeting minutes, decisions, planning, retrospectives
- Organized by hackathon
- Tags for categorization

### Notifications
- Real-time notifications via Socket.IO
- Assigned tasks, upcoming deadlines, comments, uploads, hackathon updates
- Mark as read / Mark all as read

### Analytics
- Total hackathons, won, win rate
- Tasks completed
- Contributions by teammate
- Monthly productivity trends
- Team activity timeline

## Project Structure

```
the-phantoms-hub/
├── backend/
│   ├── config/            # Database configuration
│   ├── controllers/       # API route handlers
│   ├── middleware/         # Auth, upload middleware
│   ├── models/            # Mongoose schemas
│   ├── routes/            # Express route definitions
│   ├── utils/             # Token generation, email
│   ├── uploads/           # File upload storage
│   ├── server.js          # Entry point
│   ├── seedData.js        # Database seeder
│   └── package.json
├── frontend/
│   ├── public/            # Static assets
│   └── src/
│       ├── api/           # Axios instance & API calls
│       ├── components/    # Reusable UI components
│       │   ├── calendar/
│       │   ├── charts/
│       │   ├── layout/    # Sidebar, Navbar, MainLayout
│       │   └── ui/        # Modal, Badge, Cards, etc.
│       ├── context/       # Auth & Socket providers
│       └── pages/         # Page components
│           ├── auth/
│           ├── dashboard/
│           ├── hackathons/
│           ├── tasks/
│           ├── resources/
│           ├── calendar/
│           ├── team/
│           ├── notes/
│           ├── notifications/
│           └── analytics/
│   ├── index.html
│   ├── vite.config.js
│   └── package.json
├── .gitignore
└── README.md
```

## API Endpoints

### Auth
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/auth/register` | Register new user |
| POST | `/api/auth/login` | Login user |
| GET | `/api/auth/me` | Get current user |
| PUT | `/api/auth/me` | Update profile |

### Hackathons
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/hackathons` | List all hackathons |
| GET | `/api/hackathons/:id` | Get hackathon details |
| POST | `/api/hackathons` | Create hackathon |
| PUT | `/api/hackathons/:id` | Update hackathon |
| DELETE | `/api/hackathons/:id` | Soft delete (archive) |
| PUT | `/api/hackathons/:id/archive` | Toggle archive |

### Ideas
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/ideas/:hackathonId` | Get ideas for hackathon |
| POST | `/api/ideas/:hackathonId` | Create idea |
| PUT | `/api/ideas/:id` | Update idea |
| DELETE | `/api/ideas/:id` | Delete idea |
| POST | `/api/ideas/:id/vote` | Toggle vote |
| POST | `/api/ideas/:id/select` | Select idea |
| POST | `/api/ideas/:id/comments` | Add comment |

### Tasks
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/tasks` | List tasks (filterable) |
| GET | `/api/tasks/:id` | Get task details |
| POST | `/api/tasks` | Create task |
| PUT | `/api/tasks/:id` | Update task |
| PATCH | `/api/tasks/:id/status` | Update status |
| DELETE | `/api/tasks/:id` | Delete task |
| POST | `/api/tasks/:id/comments` | Add comment |
| POST | `/api/tasks/:id/attachments` | Upload attachment |

### Resources
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/resources` | List all resources |
| GET | `/api/resources/hackathon/:id` | Resources by hackathon |
| POST | `/api/resources` | Upload resource |
| DELETE | `/api/resources/:id` | Delete resource |

### Calendar
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/calendar` | List events (date range) |
| POST | `/api/calendar` | Create event |
| PUT | `/api/calendar/:id` | Update event |
| DELETE | `/api/calendar/:id` | Delete event |

### Notes
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/notes` | List all notes |
| GET | `/api/notes/hackathon/:id` | Notes by hackathon |
| POST | `/api/notes` | Create note |
| PUT | `/api/notes/:id` | Update note |
| DELETE | `/api/notes/:id` | Delete note |

### Notifications
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/notifications` | Get user notifications |
| PUT | `/api/notifications/:id/read` | Mark as read |
| PUT | `/api/notifications/read-all` | Mark all as read |
| DELETE | `/api/notifications/:id` | Delete notification |

### Analytics
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/analytics/dashboard` | Dashboard stats |
| GET | `/api/analytics/data` | Full analytics |
| GET | `/api/analytics/team-activity` | Team activity feed |

### Users
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/users/team` | List team members |
| GET | `/api/users/:id` | Get user profile |

## Getting Started

### Prerequisites

- Node.js v18+
- MongoDB Atlas account (or local MongoDB)
- npm or yarn

### Installation

1. **Clone the repository**
   ```bash
   git clone <repo-url>
   cd the-phantoms-hub
   ```

2. **Install backend dependencies**
   ```bash
   cd backend
   npm install
   ```

3. **Install frontend dependencies**
   ```bash
   cd ../frontend
   npm install
   ```

4. **Configure environment variables**

   Edit `backend/.env`:
   ```env
   PORT=5000
   MONGO_URI=mongodb+srv://<username>:<password>@cluster.xxxxx.mongodb.net/phantoms-hub?retryWrites=true&w=majority
   JWT_SECRET=your_jwt_secret_here
   JWT_EXPIRES_IN=7d
   CLIENT_URL=http://localhost:5173
   ```

5. **Seed the database** (optional — creates 4 team members, 3 hackathons, and sample data)
   ```bash
   cd backend
   npm run seed
   ```

6. **Start the backend server**
   ```bash
   npm run dev
   ```

7. **Start the frontend dev server** (in a separate terminal)
   ```bash
   cd frontend
   npm run dev
   ```

8. **Access the application**

   Open http://localhost:5173 in your browser.

   **Demo credentials** (after seeding):
   - Alex Chen: `alex@phantoms.dev` / `password123`
   - Maya Patel: `maya@phantoms.dev` / `password123`
   - Jordan Kim: `jordan@phantoms.dev` / `password123`
   - Sarah Williams: `sarah@phantoms.dev` / `password123`

### Production Build

```bash
cd frontend
npm run build
cd ../backend
NODE_ENV=production node server.js
```

## Design Theme

- **Dark mode only** — Black background (#0a0a0a)
- **Purple neon accents** — Primary actions, highlights, and glow effects
- **Futuristic dashboard** — Card-based layout with subtle borders and hover glows
- **Responsive** — Desktop-first with mobile sidebar slide-in

---

Built with ❤️ by The Phantoms
