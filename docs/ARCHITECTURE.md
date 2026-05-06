# Architecture Overview

## System Architecture

SalesPulse CRM follows a **client-server architecture** with a clear separation of concerns:

```
┌─────────────────────────────────────────────────────┐
│                    Client (React)                   │
│  ┌─────────┐  ┌────────┐  ┌──────────┐  ┌──────┐  │
│  │ Pages   │  │ Comps  │  │ Context  │  │ API  │  │
│  └────┬────┘  └────┬───┘  └────┬─────┘  └──┬───┘  │
│       └────────────┴───────────┴────────────┘      │
│                        │ Axios (HTTP + JWT)         │
└────────────────────────┼───────────────────────────┘
                         │
                    ┌────▼────┐
                    │  Vite   │ (Proxy in dev)
                    │  Proxy  │
                    └────┬────┘
                         │
┌────────────────────────┼───────────────────────────┐
│              Server (Express.js)                    │
│  ┌──────────┐  ┌───────────┐  ┌────────────────┐  │
│  │  Routes  │  │Middleware │  │  Validators    │  │
│  └────┬─────┘  └─────┬─────┘  └───────┬────────┘  │
│       └───────────────┴────────────────┘           │
│                        │                            │
│              ┌─────────▼─────────┐                  │
│              │  SQLite Database  │                  │
│              │    (crm.db)       │                  │
│              └───────────────────┘                  │
└─────────────────────────────────────────────────────┘
```

## Frontend Architecture

### Tech Stack
- **React 19** — UI library
- **React Router v7** — Client-side routing
- **Axios** — HTTP client with interceptors
- **Recharts** — Data visualization (charts)
- **Lucide React** — Icon library
- **React Hot Toast** — Toast notifications

### Component Structure
```
src/
├── context/
│   └── AuthContext.jsx    # Auth state management (login/logout/token)
├── services/
│   └── api.js             # Axios instance with JWT interceptor
├── components/
│   └── Layout.jsx         # App shell (sidebar + main content area)
├── pages/
│   ├── LoginPage.jsx      # Authentication page
│   ├── DashboardPage.jsx  # Stats, charts, activity feed
│   ├── LeadsListPage.jsx  # Lead table with search/filter/pagination
│   ├── LeadDetailPage.jsx # Single lead view with notes + timeline
│   └── LeadFormPage.jsx   # Create/edit lead form
└── App.jsx                # Router + protected routes
```

### State Management
- **AuthContext** — Global auth state via React Context
- **Component-local state** — Each page manages its own data via `useState` + `useEffect`
- **URL state** — Filters/search params synced to URL via `useSearchParams`

### Routing
| Path | Component | Auth Required |
|------|-----------|:------------:|
| `/login` | LoginPage | No |
| `/` | DashboardPage | Yes |
| `/leads` | LeadsListPage | Yes |
| `/leads/new` | LeadFormPage | Yes |
| `/leads/:id` | LeadDetailPage | Yes |
| `/leads/:id/edit` | LeadFormPage | Yes |

## Backend Architecture

### Tech Stack
- **Node.js + Express** — HTTP server
- **better-sqlite3** — Synchronous SQLite driver
- **jsonwebtoken** — JWT auth tokens
- **bcryptjs** — Password hashing
- **express-validator** — Input validation
- **morgan** — Request logging

### API Structure
```
server/
├── config/
│   ├── database.js   # SQLite connection + table creation
│   └── seed.js       # Demo data seeder
├── middleware/
│   └── auth.js       # JWT verification middleware
├── routes/
│   ├── auth.js       # POST /login, GET /me
│   ├── leads.js      # Full CRUD + notes
│   ├── dashboard.js  # Aggregated stats + pipeline
│   └── users.js      # Salespeople list
└── server.js         # Express app entry point
```

### Authentication Flow
1. User sends `POST /api/auth/login` with email + password
2. Server verifies credentials against hashed password in DB
3. Server returns JWT token (expires in 24h)
4. Client stores token in `localStorage`
5. Every subsequent API call includes `Authorization: Bearer <token>`
6. `auth.js` middleware validates token before route handlers

## Database Schema

### ERD
```
┌──────────────┐      ┌──────────────┐
│    users     │      │    leads     │
├──────────────┤      ├──────────────┤
│ id (PK)      │◄─────│ assigned_to  │
│ name         │      │ id (PK)      │
│ email        │      │ name         │
│ password_hash│      │ company      │
│ role         │      │ email        │
│ avatar_color │      │ phone        │
│ created_at   │      │ source       │
└──────┬───────┘      │ status       │
       │              │ deal_value   │
       │              │ priority     │
       │              │ created_at   │
       │              │ updated_at   │
       │              └──────┬───────┘
       │                     │
       │              ┌──────┴───────┐
       │              │    notes     │
       └──────────────┤              │
    created_by (FK)   │ id (PK)      │
                      │ lead_id (FK) │
                      │ content      │
                      │ created_by   │
                      │ created_at   │
                      └──────────────┘
```

### Design Decisions
- **SQLite** chosen for zero-config portability — no external database server needed
- **WAL mode** enabled for concurrent read performance
- **Foreign keys** enforced for data integrity
- **ON DELETE CASCADE** on notes — deleting a lead removes its notes
- **activity_log** table tracks all lead changes for audit trail
