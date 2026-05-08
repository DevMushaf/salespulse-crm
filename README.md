# SalesPulse CRM — Lead Management System

A full-stack CRM Lead Management System built for sales teams to manage leads, track pipeline progress, add notes, and view real-time dashboard analytics.

---

## 📋 Project Overview

**SalesPulse CRM** is a modern, dark-themed CRM application designed for small sales teams. It provides:

- 🔐 **Secure Authentication** — JWT-based login system
- 📊 **Interactive Dashboard** — Real-time stats, pipeline charts, team performance
- 👥 **Lead Management** — Full CRUD operations with status pipeline
- 📝 **Lead Notes** — Add internal notes with author tracking
- 🔍 **Search & Filtering** — Filter by status, source, salesperson + text search
- 📱 **Responsive Design** — Works on desktop, tablet, and mobile

---

## 🛠 Tech Stack

| Layer | Technology |
|-------|-----------|
| **Frontend** | React 19, Vite, React Router v7 |
| **Backend** | Node.js, Express.js |
| **Database** | SQLite (via better-sqlite3) |
| **Authentication** | JWT (jsonwebtoken + bcryptjs) |
| **Charts** | Recharts |
| **Icons** | Lucide React |
| **Styling** | Vanilla CSS (custom dark theme design system) |
| **HTTP Client** | Axios |
| **Notifications** | React Hot Toast |

---

## ✨ Features Implemented

### Core Features
- ✅ Authentication (JWT login/logout with protected routes)
- ✅ Lead CRUD (Create, Read, Update, Delete)
- ✅ Lead status management with visual pipeline
- ✅ Lead notes with author tracking
- ✅ Dashboard with 8 stat cards + charts
- ✅ Search by name, company, or email
- ✅ Filter by status, source, assigned salesperson
- ✅ Pagination and sorting
- ✅ Data persistence (SQLite database)

### Bonus Features
- ✅ **Interactive Status Pipeline** — Click-to-update status on lead detail page
- ✅ **Activity Timeline** — Full audit log of all lead changes
- ✅ **Team Performance** — Salesperson leaderboard with won deal values
- ✅ **Lead Source Analytics** — Donut chart showing lead distribution by source
- ✅ **Priority System** — Leads have Low/Medium/High/Critical priority levels
- ✅ **Win Rate & Conversion Metrics** — Calculated KPIs on dashboard
- ✅ **Pipeline Value Tracking** — Active pipeline value vs won/lost
- ✅ **URL-synced Filters** — Filter state preserved in URL for shareability
- ✅ **Responsive Mobile Design** — Collapsible sidebar, touch-friendly
- ✅ **Input Validation** — Client-side and server-side validation
- ✅ **Error Handling** — Graceful error states with toast notifications

---

## 🚀 How to Run Locally

### Prerequisites
- **Node.js** v18 or higher
- **npm** v9 or higher

### Step 1: Clone the repository
```bash
git clone https://github.com/YOUR_USERNAME/salespulse-crm.git
cd salespulse-crm
```

### Step 2: Set up the Backend
```bash
cd server
npm install
```

Create a `.env` file (or copy the example):
```bash
cp .env.example .env
```

Seed the database with demo data:
```bash
npm run seed
```

Start the backend server:
```bash
npm run dev
```

The API will be running at `http://localhost:5000`.

### Step 3: Set up the Frontend
Open a new terminal:
```bash
cd client
npm install
npm run dev
```

The frontend will be running at `http://localhost:3000`.

### Step 4: Open the app
Navigate to **http://localhost:3000** in your browser.

---

## 🔑 Test Login Credentials

| Field | Value |
|-------|-------|
| **Email** | `admin@example.com` |
| **Password** | `password123` |

Additional test users (same password):
- `sarah@example.com` (Salesperson)
- `mike@example.com` (Salesperson)
- `emily@example.com` (Salesperson)

---

## 🔧 Environment Variables

### Backend (`server/.env`)
| Variable | Description | Default |
|----------|-------------|---------|
| `PORT` | Server port | `5000` |
| `JWT_SECRET` | Secret key for JWT signing | (set in .env) |
| `JWT_EXPIRES_IN` | Token expiration time | `24h` |
| `NODE_ENV` | Environment mode | `development` |

---

## 🗄 Database Setup

The database uses **SQLite** — no external database server required!

- The database file (`crm.db`) is auto-created when the server starts
- Run `npm run seed` in the server directory to populate with demo data
- The seed script creates 4 users, 12 leads, 12 notes, and 7 activity log entries

### Database Schema
- **users** — id, name, email, password_hash, role, avatar_color, created_at
- **leads** — id, name, company, email, phone, source, assigned_to, status, deal_value, priority, created_at, updated_at
- **notes** — id, lead_id, content, created_by, created_at
- **activity_log** — id, lead_id, user_id, action, details, created_at

See [docs/ARCHITECTURE.md](docs/ARCHITECTURE.md) for the full ERD diagram.

---

## 📁 Project Structure

```
crm-app/
├── client/                     # React frontend
│   ├── src/
│   │   ├── components/
│   │   │   └── Layout.jsx      # App shell with sidebar
│   │   ├── context/
│   │   │   └── AuthContext.jsx  # Authentication state
│   │   ├── pages/
│   │   │   ├── LoginPage.jsx
│   │   │   ├── DashboardPage.jsx
│   │   │   ├── LeadsListPage.jsx
│   │   │   ├── LeadDetailPage.jsx
│   │   │   └── LeadFormPage.jsx
│   │   ├── services/
│   │   │   └── api.js          # Axios instance
│   │   ├── App.jsx             # Router setup
│   │   ├── App.css             # Component styles
│   │   ├── index.css           # Base styles + design system
│   │   └── main.jsx            # Entry point
│   ├── index.html
│   └── vite.config.js
├── server/                     # Express backend
│   ├── config/
│   │   ├── database.js         # SQLite setup
│   │   └── seed.js             # Demo data seeder
│   ├── middleware/
│   │   └── auth.js             # JWT verification
│   ├── routes/
│   │   ├── auth.js             # Login + user endpoints
│   │   ├── leads.js            # Lead CRUD + notes
│   │   ├── dashboard.js        # Analytics endpoints
│   │   └── users.js            # Salespeople list
│   ├── server.js               # Express entry point
│   ├── .env.example
│   └── package.json
├── docs/
│   ├── ARCHITECTURE.md         # System architecture
│   ├── API.md                  # API reference
│   ├── STYLEGUIDE.md           # Design system
│   └── CONVENTIONS.md          # Coding conventions
└── README.md
```

---

## ⚠️ Known Limitations

1. **No user registration** — Only pre-seeded users can login (by design for the assessment)
2. **No file uploads** — Notes are text-only
3. **No email notifications** — No SMTP integration
4. **No role-based access control** — All logged-in users have full access
5. **Single-server SQLite** — Not suitable for production at scale (would migrate to PostgreSQL)
6. **No automated tests** — Manual testing only (would add Jest + React Testing Library)

---

## 💭 Reflection

### What I learned
Building this project deepened my understanding of full-stack architecture — particularly how the frontend and backend communicate through a REST API, how JWT authentication creates a stateless session system, and how database design directly impacts API complexity.

### Challenges faced
- **State synchronization** — Keeping the lead list, detail page, and dashboard in sync after mutations required careful API call patterns
- **Filter URL persistence** — Syncing React state with URL search params for shareable filter URLs took some iteration
- **CSS design system** — Building a cohesive dark theme from scratch required establishing tokens and being disciplined about reuse

### What I'd improve with more time
- Add comprehensive unit and integration tests
- Implement WebSocket for real-time updates across tabs
- Add CSV export for lead data
- Build email template integration for follow-ups
- Add drag-and-drop Kanban board view
- Implement proper RBAC (role-based access control)

### Tools and resources used
- React and Express documentation
- MDN Web Docs for CSS reference
- SQLite documentation for query syntax
- Recharts documentation for chart configuration

---

## 🎬 Demo Video

Link to demo video — 

---

## Vercel link

Link — https://salespulse-crm-one.vercel.app/

## 📄 License

This project was built as a take-home assessment. Not for production use.
