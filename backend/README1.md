# Ovia Backend

FastAPI backend for **CalendarScreen**, **ExerciseScreen**, and **ExerciseDetailScreen**.

---

## Stack

| Layer       | Technology                              |
|-------------|------------------------------------------|
| Framework   | FastAPI 0.111                            |
| ORM         | SQLAlchemy 2 (async)                     |
| Database    | SQLite via `aiosqlite` (swap to Postgres for prod) |
| Auth        | JWT (python-jose) + bcrypt (passlib)     |
| HTTP client | httpx (YouTube API calls)                |
| Config      | pydantic-settings + `.env`               |

---

## Project Structure

```
ovia-backend/
├── main.py                  # App entry point
├── requirements.txt
├── .env.example
├── core/
│   ├── config.py            # Settings (reads .env)
│   ├── database.py          # Async engine + session + init_db()
│   ├── security.py          # JWT + bcrypt helpers
│   └── dependencies.py      # get_current_user() FastAPI dependency
├── models/
│   ├── user.py              # User ORM model
│   ├── task.py              # Task ORM model       ← CalendarScreen
│   ├── cycle.py             # CycleLog ORM model   ← CalendarScreen highlights
│   └── exercise.py          # ExerciseProgress     ← ExerciseDetailScreen
├── routers/
│   ├── schemas.py           # All Pydantic request/response models
│   ├── auth.py              # /api/v1/auth/*
│   ├── tasks.py             # /api/v1/tasks/*
│   ├── cycle.py             # /api/v1/cycle/*
│   └── exercises.py         # /api/v1/exercises/*
├── services/
│   ├── youtube.py           # YouTube Data API v3 + curated fallback
│   └── exercise_modules.py  # ALL_MODULES catalogue (mirrors ExerciseScreen.js)
└── middleware/
    └── cors.py              # CORS setup
```

---

## Setup

```bash
# 1. Clone & enter
git clone <repo>
cd ovia-backend

# 2. Create virtual environment
python -m venv .venv
source .venv/bin/activate   # Windows: .venv\Scripts\activate

# 3. Install dependencies
pip install -r requirements.txt

# 4. Configure environment
cp .env.example .env
# Edit .env — set SECRET_KEY and optionally YOUTUBE_API_KEY

# 5. Run
uvicorn main:app --reload --port 8000
```

Swagger UI → http://localhost:8000/docs  
ReDoc      → http://localhost:8000/redoc

---

## Environment Variables

| Variable                     | Required | Default                            | Description                              |
|------------------------------|----------|------------------------------------|------------------------------------------|
| `DATABASE_URL`               | No       | `sqlite+aiosqlite:///./ovia.db`    | SQLAlchemy async DB URL                  |
| `SECRET_KEY`                 | **Yes**  | —                                  | JWT signing key                          |
| `ALGORITHM`                  | No       | `HS256`                            | JWT algorithm                            |
| `ACCESS_TOKEN_EXPIRE_MINUTES`| No       | `43200` (30 days)                  | Token TTL                                |
| `YOUTUBE_API_KEY`            | No       | `""`                               | YouTube Data API v3 key. Falls back to curated list if blank. |

---

## API Reference

All protected endpoints require:
```
Authorization: Bearer <access_token>
```

### Auth — `/api/v1/auth`

| Method | Path        | Auth | Description                  |
|--------|-------------|------|------------------------------|
| POST   | `/register` | ✗    | Create account, returns JWT  |
| POST   | `/login`    | ✗    | Login, returns JWT           |
| GET    | `/me`       | ✓    | Get current user profile     |

**Register / Login body:**
```json
{ "name": "Priya", "email": "priya@example.com", "password": "secret123" }
```

---

### Tasks — `/api/v1/tasks` ← CalendarScreen

| Method | Path                      | Auth | Description                                      |
|--------|---------------------------|------|--------------------------------------------------|
| GET    | `/{date}`                 | ✓    | Get all tasks for `YYYY-MM-DD`                   |
| POST   | `/`                       | ✓    | Create a task (today or future only)             |
| PATCH  | `/{task_id}/status`       | ✓    | Toggle `done` / `skip` / `pending`               |
| DELETE | `/{task_id}`              | ✓    | Delete a task                                    |
| GET    | `/month/{year}/{month}`   | ✓    | Calendar dot summary for a whole month           |

**Create Task body:**
```json
{
  "icon": "💊",
  "title": "Take iron tablets",
  "sub": "With warm water after meal",
  "time": "08:00 AM",
  "color": "#FB6F92",
  "bg": "#FFFFFF",
  "task_date": "2025-06-15"
}
```

**Status Update body:**
```json
{ "status": "done" }   // "done" | "skip" | "pending"
```

---

### Cycle — `/api/v1/cycle` ← CalendarScreen period highlights

| Method | Path           | Auth | Description                                     |
|--------|----------------|------|-------------------------------------------------|
| POST   | `/`            | ✓    | Log a new period start date                     |
| GET    | `/`            | ✓    | List cycle history                              |
| GET    | `/highlights`  | ✓    | **Period / fertile / ovulation dates for CalendarScreen** |
| GET    | `/{id}`        | ✓    | Single cycle log                                |
| DELETE | `/{id}`        | ✓    | Delete a cycle log                              |

**Log Cycle body:**
```json
{
  "period_start": "2025-06-01",
  "period_end": "2025-06-05",
  "cycle_length": 28,
  "period_length": 5,
  "flow_intensity": "medium",
  "pain_score": 4.0,
  "notes": "Cramps on day 1-2"
}
```

**Highlights response** (used by CalendarScreen to colour days):
```json
{
  "period_days":    ["2025-06-01", "2025-06-02", ...],
  "fertile_days":   ["2025-06-10", "2025-06-11", ...],
  "ovulation_days": ["2025-06-15"],
  "predicted_next_period": "2025-06-29"
}
```

---

### Exercises — `/api/v1/exercises` ← ExerciseScreen + ExerciseDetailScreen

| Method | Path                          | Auth | Description                                         |
|--------|-------------------------------|------|-----------------------------------------------------|
| GET    | `/categories`                 | ✗    | All category filter chips                           |
| GET    | `/modules`                    | ✗    | All modules (supports `?category=&search=`)         |
| GET    | `/modules/{id}`               | ✗    | Single module                                       |
| GET    | `/modules/{id}/videos`        | ✗    | YouTube videos for a module (API or fallback)       |
| POST   | `/progress`                   | ✓    | Log user opened/watched a video                     |
| GET    | `/progress`                   | ✓    | User's exercise history (supports `?module_id=`)    |
| GET    | `/bookmarks`                  | ✓    | User's bookmarked videos                            |
| PATCH  | `/progress/{id}`              | ✓    | Mark completed or toggle bookmark                   |
| DELETE | `/progress/{id}`              | ✓    | Remove a progress entry                             |

**Videos response:**
```json
{
  "module_id": "1",
  "search_query": "period cramps relief yoga exercises",
  "source": "youtube_api",
  "videos": [
    {
      "video_id": "qFpKb_GTCT8",
      "title": "Yoga for Period Cramps Relief",
      "channel": "Yoga With Adriene",
      "description": "...",
      "thumbnail_url": "https://img.youtube.com/vi/qFpKb_GTCT8/hqdefault.jpg",
      "youtube_url": "https://www.youtube.com/watch?v=qFpKb_GTCT8"
    }
  ]
}
```

---

## Connecting the React Native App

Replace the local `AsyncStorage` calls and hardcoded arrays with API calls:

```js
// api.js
const BASE = 'http://localhost:8000/api/v1';

// Auth
export const login  = (email, password) =>
  fetch(`${BASE}/auth/login`,  { method:'POST', headers:{'Content-Type':'application/json'}, body: JSON.stringify({email,password}) }).then(r=>r.json());

// Tasks (CalendarScreen)
export const getDayTasks   = (date, token) =>
  fetch(`${BASE}/tasks/${date}`, { headers:{ Authorization:`Bearer ${token}` } }).then(r=>r.json());

export const createTask    = (payload, token) =>
  fetch(`${BASE}/tasks`, { method:'POST', headers:{ Authorization:`Bearer ${token}`, 'Content-Type':'application/json' }, body: JSON.stringify(payload) }).then(r=>r.json());

export const updateStatus  = (taskId, status, token) =>
  fetch(`${BASE}/tasks/${taskId}/status`, { method:'PATCH', headers:{ Authorization:`Bearer ${token}`, 'Content-Type':'application/json' }, body: JSON.stringify({status}) }).then(r=>r.json());

// Cycle highlights (CalendarScreen period colouring)
export const getHighlights = (token) =>
  fetch(`${BASE}/cycle/highlights`, { headers:{ Authorization:`Bearer ${token}` } }).then(r=>r.json());

// Exercise modules (ExerciseScreen)
export const getModules    = (category, search) =>
  fetch(`${BASE}/exercises/modules?category=${category??''}&search=${search??''}`).then(r=>r.json());

// Videos (ExerciseDetailScreen)
export const getVideos     = (moduleId) =>
  fetch(`${BASE}/exercises/modules/${moduleId}/videos`).then(r=>r.json());
```

---

## Production Notes

- Swap `sqlite+aiosqlite` for `postgresql+asyncpg` in `DATABASE_URL`
- Set a strong random `SECRET_KEY`
- Restrict `allow_origins` in `middleware/cors.py` to your app domains
- Add your YouTube Data API v3 key in `YOUTUBE_API_KEY`
- Deploy with `uvicorn main:app --host 0.0.0.0 --port 8000 --workers 4`
