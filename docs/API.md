# API Reference

Base URL: `http://localhost:5000/api`

All endpoints except `/auth/login` require a valid JWT token in the `Authorization` header:
```
Authorization: Bearer <token>
```

---

## Authentication

### POST /auth/login
Authenticate a user and receive a JWT token.

**Request Body:**
```json
{
  "email": "admin@example.com",
  "password": "password123"
}
```

**Response (200):**
```json
{
  "message": "Login successful",
  "token": "eyJhbGciOiJIUzI1...",
  "user": {
    "id": 1,
    "name": "Admin User",
    "email": "admin@example.com",
    "role": "admin",
    "avatar_color": "#6366f1"
  }
}
```

**Error (401):**
```json
{ "error": "Invalid email or password." }
```

### GET /auth/me
Get the currently authenticated user.

**Response (200):**
```json
{
  "user": { "id": 1, "name": "Admin User", "email": "admin@example.com", "role": "admin" }
}
```

---

## Leads

### GET /leads
List leads with optional filtering, searching, sorting, and pagination.

**Query Parameters:**
| Parameter | Type | Description |
|-----------|------|-------------|
| `search` | string | Search by name, company, or email |
| `status` | string | Filter by status (New, Contacted, Qualified, Proposal Sent, Won, Lost) |
| `source` | string | Filter by source (Website, LinkedIn, Referral, Cold Email, Event, Other) |
| `assigned_to` | number | Filter by salesperson user ID |
| `priority` | string | Filter by priority (Low, Medium, High, Critical) |
| `sort` | string | Sort field (name, company, status, deal_value, created_at, updated_at) |
| `order` | string | Sort order (asc, desc). Default: desc |
| `page` | number | Page number. Default: 1 |
| `limit` | number | Items per page (1-100). Default: 20 |

**Response (200):**
```json
{
  "leads": [...],
  "pagination": { "page": 1, "limit": 20, "total": 12, "totalPages": 1 }
}
```

### GET /leads/:id
Get a single lead with its notes and activity log.

**Response (200):**
```json
{
  "lead": { "id": 1, "name": "John Smith", ... },
  "notes": [...],
  "activities": [...]
}
```

### POST /leads
Create a new lead.

**Request Body:**
```json
{
  "name": "Jane Doe",
  "company": "TechCo",
  "email": "jane@techco.com",
  "phone": "+1-555-0123",
  "source": "Website",
  "assigned_to": 2,
  "status": "New",
  "deal_value": 25000,
  "priority": "High"
}
```

**Required fields:** `name`, `company`, `source`

### PUT /leads/:id
Update an existing lead. Only provided fields are updated.

### DELETE /leads/:id
Delete a lead and its associated notes/activity.

---

## Notes

### GET /leads/:id/notes
Get all notes for a specific lead, ordered by newest first.

### POST /leads/:id/notes
Add a note to a lead.

**Request Body:**
```json
{ "content": "Had a productive call. Moving to next stage." }
```

---

## Dashboard

### GET /dashboard
Get aggregated dashboard statistics.

**Response includes:** overview stats, source breakdown, priority breakdown, recent leads, recent activity, salesperson performance.

### GET /dashboard/pipeline
Get pipeline stage counts and values for funnel visualization.

---

## Users

### GET /users/salespeople
Get list of salespeople for assignment dropdowns.
