# PlaceSmart — AI-Powered Placement Ecosystem

PlaceSmart is a polished hackathon-ready web app connecting **Students, Recruiters and Placement Cell Coordinators** in one placement workflow.

## What works

- Separate role-based authentication for Student / Recruiter / Placement Cell
- Unique logged-in identity in every dashboard
- Secure session token with expiry and server-side session invalidation on logout
- Refresh-safe authentication (`/api/auth/me`)
- Proper logout — token and user state are cleared and the user returns to the landing page
- Role-protected backend APIs
- Student job discovery and real application submission
- Recruiter job creation and job closing
- Recruiter candidate screening workspace
- Placement Cell student registry and notices
- Rule-based skill matching API labelled as AI assistance
- Responsive dashboard UI for desktop and mobile
- Production deployment configuration for Render backend + Vercel frontend

## Tech stack

**Frontend:** React 18, Vite, Tailwind CSS, Recharts, Lucide React

**Backend:** Node.js, Express, CORS, dotenv

The demo backend uses in-memory data so it can run without MongoDB. This is suitable for a hackathon/demo deployment. For production scale, replace the in-memory stores with MongoDB/PostgreSQL/another persistent database.

## Demo accounts

| Workspace | Email | Password |
|---|---|---|
| Student | `student@placesmart.demo` | `student123` |
| Placement Cell | `coordinator@placesmart.demo` | `coordinator123` |
| Recruiter | `recruiter@placesmart.demo` | `recruiter123` |

These are demo credentials only. Change them before using the application with real users.

## Run locally

### Backend

```bash
cd backend
npm install
cp .env.example .env
npm run dev
```

Windows PowerShell:

```powershell
cd backend
npm install
Copy-Item .env.example .env
npm run dev
```

Backend: `http://localhost:3001`

### Frontend

Open another terminal:

```bash
cd frontend
npm install
npm run dev
```

Frontend: `http://localhost:5173`

## Publish it

### 1. Deploy backend on Render

Use the included `render.yaml` or create a Node web service with:

- Root directory: `backend`
- Build command: `npm install`
- Start command: `npm start`
- `JWT_SECRET`: generate a long random value
- `CLIENT_URL`: your deployed Vercel frontend URL

### 2. Deploy frontend on Vercel

Create a Vercel project from the repository and set:

- Root directory: `frontend`
- Build command: `npm run build`
- Output directory: `dist`
- Environment variable: `VITE_API_URL=https://YOUR-BACKEND-DOMAIN/api`

The included `frontend/vercel.json` handles SPA routing.

## Important production note

The current app intentionally uses in-memory demo records. Restarting the backend resets jobs/applications/notices and clears active sessions. For a real college deployment, connect the same API layer to a persistent database and replace the demo credentials with a proper user/college/company onboarding flow.

## New AI & Placement Automation

The latest build includes role-specific workflows:

- Student: AI Resume Parser, GenAI-style Interview Coach, Skill Gap Analyzer, Auto Eligibility Checker, AI Analyzer and placement tracking.
- Recruiter: Candidate Search & Filters, skill-based candidate matching, Auto Eligibility, Interview Coach, Skill Gap Analyzer and AI Hiring Analyzer.
- Placement Cell: Student Management, editable Placement Status Tracking, Skill Gap Analyzer, Drive Eligibility and AI Placement Analyzer.

These AI features use an explainable local rules/heuristics layer by default, so the app works without an external AI API key. The API endpoints are under `/api/ai/*` and can later be replaced or extended with an LLM provider.
