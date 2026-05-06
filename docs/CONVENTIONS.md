# Coding Conventions

## General
- **Language:** JavaScript (ES6+) throughout
- **No TypeScript** — Kept simple for the assessment scope
- **Semicolons:** Used consistently
- **Quotes:** Single quotes for JS, double for JSX attributes
- **Indentation:** 2 spaces

## Frontend Conventions

### File Naming
- Components/Pages: `PascalCase.jsx` (e.g., `LeadDetailPage.jsx`)
- Services/Utils: `camelCase.js` (e.g., `api.js`)
- Styles: `kebab-case.css`

### Component Structure
```jsx
// 1. Imports (React, libraries, local)
import { useState } from 'react';
import api from '../services/api';

// 2. Constants
const STATUSES = ['New', 'Contacted', ...];

// 3. Helper functions
function formatCurrency(val) { ... }

// 4. Component (default export)
export default function PageName() {
  // State
  // Effects
  // Handlers
  // Render
}
```

### State Management
- Use React Context only for truly global state (auth)
- Component-local state via `useState` for page data
- URL params via `useSearchParams` for shareable filter state
- No external state library (Redux, Zustand, etc.) needed at this scale

### API Calls
- All API calls go through the centralized `api.js` Axios instance
- JWT token attached automatically via interceptor
- Error handling in individual components with `try/catch`
- Toast notifications for user feedback

## Backend Conventions

### File Naming
- All lowercase with hyphens if needed
- One file per route group
- Route files export an Express Router

### Route Structure
```javascript
// Validation → Handler → Response
router.post('/',
  [body('name').trim().notEmpty()],  // Validation
  (req, res) => {                     // Handler
    const errors = validationResult(req);
    // ... business logic
    res.json({ message, data });      // Response
  }
);
```

### Error Handling
- Input validation via `express-validator`
- Try/catch blocks in every route handler
- Consistent error response format: `{ error: "message" }`
- HTTP status codes used correctly (200, 201, 400, 401, 404, 500)

### Database
- Raw SQL queries (no ORM) for transparency and learning
- Prepared statements to prevent SQL injection
- Parameterized queries for all user input
- Foreign keys enforced at database level

## Git Conventions
- Meaningful commit messages
- `.env` file excluded from version control
- `.env.example` provided for setup reference
