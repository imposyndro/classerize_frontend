# Classerize Frontend

Next.js 15 App Router frontend for the Classerize multi-LMS aggregation platform.

---

## Stack

| Layer | Technology |
|-------|-----------|
| Framework | Next.js 15 (App Router) |
| Styling | Tailwind CSS |
| Calendar | react-big-calendar + date-fns |
| Auth | JWT cookies via backend; AuthContext + withAuth HOC |
| API | Centralized `apiClient.js` (auto-401 redirect) |

---

## Quick Start

```bash
cp .env.local.example .env.local
# Set NEXT_PUBLIC_API_URL=http://localhost:5000

npm install
npm run dev
# Open http://localhost:3001
```

---

## Environment Variables

```
NEXT_PUBLIC_API_URL=http://localhost:5000
```

---

## Pages

| Route | Description | Auth |
|-------|-------------|------|
| `/login` | Login + Google SSO | Public |
| `/register` | Account creation | Public |
| `/dashboard` | Linked accounts + calendar | Required |
| `/assignments` | Filter/manage assignments | Required |
| `/gradebook` | Course grade summary | Required |
| `/notifications` | Notification inbox | Required |
| `/settings` | Linked accounts, notifications, Google Calendar | Required |
| `/course/[id]` | Course detail + assignments | Required |
| `/study-schedule` | AI study plan | Required |

---

## Key Components

```
src/
├── app/                    # Next.js App Router pages
├── components/
│   ├── assignments/        # AssignmentCard
│   ├── buttons/            # PrimaryButton, SecondaryButton
│   ├── dashboard/          # Navbar, AccountCard, CanvasLinker, CalendarView
│   └── layouts/            # DashboardLayout (sidebar nav)
├── context/AuthContext.js  # useAuth() hook + withAuth HOC
└── lib/apiClient.js        # Fetch wrapper with credentials + auto-redirect
```

---

## Auth Flow

1. Login → backend sets `token` httpOnly cookie
2. All API calls use `credentials: 'include'`
3. 401 response → `apiClient.js` redirects to `/login`
4. Google SSO → `GET /api/auth/google` → callback sets cookie → redirect to `/dashboard`
5. Protected pages use `withAuth(Component)` HOC which checks `useAuth()` state

---

## Connecting an LMS Account

**Canvas:** Dashboard → "Link Canvas Account" → enter institution URL + API token

**Google Classroom:** Linked automatically on Google SSO login (requires Classroom OAuth scopes on backend)

**Blackboard / Moodle:** Settings → Linked Accounts → respective tab

---

## Development Notes

- API proxy is not configured — all requests go directly to `NEXT_PUBLIC_API_URL`
- Calendar uses `react-big-calendar`; iCal export hits `GET /api/calendar/export.ics`
- No `localStorage` usage — all auth state is cookie-based
