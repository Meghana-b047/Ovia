# Ovia Backend API 🌸

FastAPI + SQLite backend for the Ovia FemTech mobile app.
Zero external database setup — SQLite file is created automatically on first run.

---

## Tech Stack

| Layer | Technology |
|---|---|
| Framework | FastAPI 0.111 |
| Database | SQLite (async via aiosqlite) |
| ORM | SQLAlchemy 2.0 (async) |
| Migrations | Alembic |
| Auth | JWT (python-jose) + bcrypt |
| OAuth | Google ID Token verification |
| Validation | Pydantic v2 |

---

## Project Structure

```
ovia-backend/
├── app/
│   ├── main.py                  # FastAPI app entry point
│   ├── api/v1/
│   │   ├── router.py            # Mounts all route groups
│   │   └── endpoints/
│   │       ├── auth.py          # /api/v1/auth/*
│   │       ├── onboarding.py    # /api/v1/onboarding
│   │       └── cycle.py         # /api/v1/cycle/*
│   ├── core/
│   │   ├── config.py            # Settings (reads .env)
│   │   ├── security.py          # JWT + bcrypt helpers
│   │   └── dependencies.py      # FastAPI Depends (DB session, current user)
│   ├── db/
│   │   └── session.py           # Async SQLAlchemy engine + Base
│   ├── models/
│   │   ├── user.py              # users table
│   │   ├── onboarding.py        # onboarding_profiles table
│   │   └── cycle.py             # cycle_logs table
│   ├── schemas/
│   │   ├── auth.py              # Register / Login / Token schemas
│   │   ├── onboarding.py        # Onboarding request/response
│   │   └── cycle.py             # Cycle log schemas + phase response
│   └── services/
│       ├── auth_service.py      # Register, login, Google OAuth logic
│       ├── onboarding_service.py
│       └── cycle_service.py     # Prediction engine + CRUD
├── alembic/                     # DB migrations
├── ovia.db                      # SQLite file (auto-created on first run)
├── requirements.txt
└── .env.example
```

---

## Setup (5 minutes, no database install needed)

### 1. Install dependencies

```bash
cd ovia-backend
python -m venv venv
source venv/bin/activate        # Windows: venv\Scripts\activate
pip install -r requirements.txt
```

### 2. Create your `.env` file

```bash
cp .env.example .env
```

The only value you **must** change is `SECRET_KEY`:
```env
DATABASE_URL=sqlite+aiosqlite:///./ovia.db
SECRET_KEY=pick-any-long-random-string-here
```

### 3. Start the server

```bash
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```

That's it. `ovia.db` is created automatically. No Postgres, no Docker needed.

- API base: `http://localhost:8000`
- Swagger UI (interactive): `http://localhost:8000/docs`
- ReDoc: `http://localhost:8000/redoc`

---

## Full API Reference

### 🔐 Auth  `/api/v1/auth`

#### `POST /api/v1/auth/register`
Register a new user with email + password.

**Request:**
```json
{
  "full_name": "Priya Sharma",
  "email": "priya@example.com",
  "age": 24,
  "password": "secret123",
  "confirm_password": "secret123"
}
```
**Response `201`:**
```json
{
  "access_token": "eyJ...",
  "refresh_token": "eyJ...",
  "token_type": "bearer",
  "onboarding_complete": false
}
```

---

#### `POST /api/v1/auth/login`
Login with email + password.

**Request:**
```json
{ "email": "priya@example.com", "password": "secret123" }
```
**Response `200`:**
```json
{
  "access_token": "eyJ...",
  "refresh_token": "eyJ...",
  "token_type": "bearer",
  "onboarding_complete": true
}
```
> Use `onboarding_complete` to decide where to redirect after login.

---

#### `POST /api/v1/auth/google`
Login or register via Google. Pass the ID token from Expo Google Sign-In.

**Request:**
```json
{ "id_token": "google-id-token-string" }
```
**Response `200`:** Same shape as login above.

---

#### `POST /api/v1/auth/refresh`
Swap a refresh token for a new token pair.

**Request:**
```json
{ "refresh_token": "eyJ..." }
```

---

#### `GET /api/v1/auth/me`
Get the currently authenticated user. Requires `Authorization: Bearer <token>`.

**Response `200`:**
```json
{
  "id": 1,
  "full_name": "Priya Sharma",
  "email": "priya@example.com",
  "age": 24,
  "auth_provider": "email",
  "is_verified": false,
  "onboarding_complete": true
}
```

---

### 📋 Onboarding  `/api/v1/onboarding`

All endpoints require `Authorization: Bearer <token>`.

#### `POST /api/v1/onboarding`
Submit all 4 steps from `OnboardingScreen.js` in one call.
Calling it again updates the existing profile (safe to re-submit).

**Request:**
```json
{
  "cycle_length_option": "26-30 days",
  "cycle_length_days": 28,
  "period_duration_option": "4-5 days",
  "period_duration_days": 5,
  "last_period_option": "Yesterday",
  "goal": "Track my cycle"
}
```

Valid enum values:
- `cycle_length_option`: `"21-25 days"` | `"26-30 days"` | `"31-35 days"` | `"Not sure"`
- `period_duration_option`: `"1-3 days"` | `"4-5 days"` | `"6-7 days"` | `"Not sure"`
- `last_period_option`: `"Today"` | `"Yesterday"` | `"2 days ago"` | `"3+ days ago"`
- `goal`: `"Track my cycle"` | `"Manage PCOS/PCOD"` | `"Plan pregnancy"` | `"General health"`

**Response `201`:**
```json
{
  "id": 1,
  "user_id": 1,
  "cycle_length_option": "26-30 days",
  "cycle_length_days": 28,
  "period_duration_option": "4-5 days",
  "period_duration_days": 5,
  "last_period_option": "Yesterday",
  "last_period_date": "2025-06-30",
  "goal": "Track my cycle"
}
```

---

#### `GET /api/v1/onboarding`
Get the saved onboarding profile.

**Response `200`:** Same shape as POST response above.

---

### 🩸 Cycle Tracking  `/api/v1/cycle`

All endpoints require `Authorization: Bearer <token>`.

#### `POST /api/v1/cycle/log`
Log a new period. Auto-runs predictions for next period + ovulation.

**Request:**
```json
{
  "period_start_date": "2025-07-01",
  "period_end_date": null,
  "flow_intensity": "medium",
  "symptoms": ["cramps", "bloating", "headache"],
  "mood": "tired",
  "notes": "Felt exhausted"
}
```
> Only `period_start_date` is required. All others are optional.

**Response `201`:**
```json
{
  "id": 1,
  "user_id": 1,
  "period_start_date": "2025-07-01",
  "period_end_date": null,
  "flow_intensity": "medium",
  "symptoms": ["cramps", "bloating", "headache"],
  "mood": "tired",
  "notes": "Felt exhausted",
  "predicted_next_period": "2025-07-29",
  "predicted_ovulation_date": "2025-07-15",
  "cycle_length_days": 28
}
```

---

#### `PATCH /api/v1/cycle/log/{log_id}`
Update a log — add end date when period finishes, or update symptoms/mood.

**Request (all fields optional):**
```json
{
  "period_end_date": "2025-07-05",
  "flow_intensity": "light",
  "symptoms": ["mild cramps"],
  "mood": "better",
  "notes": "Feeling much better by day 5"
}
```

**Response `200`:** Updated cycle log object.

---

#### `GET /api/v1/cycle/history?limit=12`
Get cycle history, most recent first. Default limit = 12.

**Response `200`:**
```json
[
  {
    "id": 3,
    "period_start_date": "2025-07-01",
    "predicted_next_period": "2025-07-29",
    "predicted_ovulation_date": "2025-07-15",
    "cycle_length_days": 28,
    ...
  }
]
```

---

#### `GET /api/v1/cycle/phase`
Get the user's **current cycle phase** with personalised exercise + nutrition tips.
Use this as the main data source for the Home Screen.

**Response `200`:**
```json
{
  "phase": "follicular",
  "day_of_cycle": 8,
  "days_until_next_period": 20,
  "predicted_next_period": "2025-07-29",
  "predicted_ovulation_date": "2025-07-15",
  "exercise_tip": "Great time for moderate cardio — try jogging, hiking, or biking 🚴",
  "nutrition_tip": "Lean proteins, healthy fats, and complex carbs will fuel your rising energy 🥑"
}
```

Phase breakdown:

| Phase | Cycle Days | Exercise Tip | Nutrition Tip |
|---|---|---|---|
| `menstrual` | 1 – 5 | Yoga, walking | Iron-rich foods + Vitamin C |
| `follicular` | 6 – 13 | Jogging, hiking, biking | Lean proteins + complex carbs |
| `ovulatory` | 14 – 16 | HIIT, strength training | Antioxidants, berries, leafy greens |
| `luteal` | 17 – end | Walking, yoga | Sweet potatoes, higher protein |

---

## Connecting from React Native

```javascript
import * as SecureStore from 'expo-secure-store';

const BASE_URL = 'http://192.168.1.X:8000'; // your machine's local IP

// Authenticated fetch helper
async function apiFetch(path, options = {}) {
  const token = await SecureStore.getItemAsync('access_token');
  const res = await fetch(`${BASE_URL}${path}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
      ...options.headers,
    },
  });
  if (!res.ok) throw await res.json();
  return res.json();
}

// RegisterScreen.js → register
const data = await fetch(`${BASE_URL}/api/v1/auth/register`, {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ full_name, email, age: parseInt(age), password, confirm_password }),
}).then(r => r.json());
await SecureStore.setItemAsync('access_token', data.access_token);
await SecureStore.setItemAsync('refresh_token', data.refresh_token);
navigation.replace(data.onboarding_complete ? 'Home' : 'Onboarding');

// OnboardingScreen.js → submit after all 4 steps
await apiFetch('/api/v1/onboarding', {
  method: 'POST',
  body: JSON.stringify({
    cycle_length_option: answers.cycle_length,
    cycle_length_days: cycleValue,
    period_duration_option: answers.period_duration,
    period_duration_days: durationValue,
    last_period_option: answers.last_period,
    goal: answers.goal,
  }),
});
navigation.replace('Home');

// Home Screen → load current phase
const phase = await apiFetch('/api/v1/cycle/phase');
// Use: phase.phase, phase.exercise_tip, phase.days_until_next_period
```

---

## Migrations

In development, tables are auto-created on startup. For production use Alembic:

```bash
alembic revision --autogenerate -m "initial schema"
alembic upgrade head
```

---

## Phase 2 Roadmap

- PCOS symptom diary + flare prediction
- Pregnancy week-by-week module + due date calculator
- Social feed (posts, likes, comments)
- Push notifications (cycle reminders, ovulation alerts)
- RAG-based health chatbot
- WebRTC telemedicine rooms
- Partner Mode with OAuth 2.0 scoped sharing
