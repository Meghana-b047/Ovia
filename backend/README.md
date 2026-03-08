# Ovia Backend — Setup Guide

## Project Structure

```
backend/
├── main.py                        ← FastAPI app entry point
├── requirements.txt
├── utils_api.js                   ← Drop into frontend: src/utils/api.js
└── app/
    ├── api/v1/
    │   ├── router.py              ← Updated router (all endpoints wired)
    │   └── endpoints/
    │       ├── auth.py            ← Register / Login / Me / Delete account
    │       ├── onboarding.py      ← Save & get onboarding answers
    │       ├── cycle.py           ← Cycle logs, symptoms, water, sleep, status
    │       ├── reminders.py       ← CRUD reminders
    │       ├── notifications.py   ← Notifications + settings
    │       ├── social.py          ← Posts, comments, likes
    │       └── calendar.py        ← Daily tasks (check/uncheck)
    ├── models/
    │   ├── user.py
    │   ├── cycle.py
    │   ├── onboarding.py          ← Also holds Reminder/Notification/Settings
    │   └── social.py              ← Also holds WaterLog/SleepLog/CalendarTask
    ├── schemas/
    │   ├── auth.py
    │   ├── onboarding.py
    │   ├── cycle.py
    │   └── misc.py                ← Reminders, notifications, social, calendar
    ├── core/
    │   ├── config.py              ← Settings (DATABASE_URL, JWT secret, etc.)
    │   ├── security.py            ← JWT helpers, password hashing
    │   └── dependencies.py        ← get_current_user dependency
    └── db/
        └── session.py             ← SQLAlchemy engine + get_db()
```

---

## Quick Start

### 1. Install dependencies
```bash
cd backend
pip install -r requirements.txt
```

### 2. (Optional) Create a `.env` file
```env
DATABASE_URL=sqlite:///./ovia.db
SECRET_KEY=your_very_long_random_secret_here
```
For Postgres: `DATABASE_URL=postgresql://user:pass@localhost/ovia`

### 3. Run the server
```bash
uvicorn main:app --reload --host 0.0.0.0 --port 8000
```

### 4. Open docs
- Swagger UI: http://localhost:8000/docs
- ReDoc:       http://localhost:8000/redoc

---

## API Endpoints Summary

| Screen | Endpoint | Method | Description |
|--------|----------|--------|-------------|
| RegisterScreen | `/api/v1/auth/register` | POST | Create account → returns tokens |
| LoginScreen | `/api/v1/auth/login` | POST | Login → returns tokens |
| ProfileScreen | `/api/v1/auth/me` | GET/PATCH | Get / update profile |
| ProfileScreen | `/api/v1/auth/me` | DELETE | Delete account |
| OnboardingScreen | `/api/v1/onboarding` | POST | Save onboarding answers |
| HomeScreen | `/api/v1/cycle/status` | GET | Current cycle day, phase, predictions |
| HomeScreen | `/api/v1/cycle/water` | GET/POST | Water tracking |
| HomeScreen | `/api/v1/cycle/sleep` | GET/POST | Sleep tracking |
| CalendarScreen | `/api/v1/cycle/log` | GET/POST | Period start dates |
| CalendarScreen | `/api/v1/cycle/symptoms` | GET/POST | Daily symptom logs |
| CalendarScreen | `/api/v1/calendar/tasks` | GET/POST/PATCH/DELETE | Daily tasks |
| RemindersScreen | `/api/v1/reminders` | GET/POST/PATCH/DELETE | Reminders CRUD |
| NotificationsScreen | `/api/v1/notifications` | GET | List notifications |
| NotificationsScreen | `/api/v1/notifications/settings` | GET/PATCH | Notification prefs |
| SocialScreen | `/api/v1/social/posts` | GET/POST | Community posts |
| SocialScreen | `/api/v1/social/posts/{id}/like` | POST | Like a post |
| SocialScreen | `/api/v1/social/posts/{id}/comments` | GET/POST | Comments |

---

## Frontend Integration

Copy `utils_api.js` → `src/utils/api.js` in your React Native project.

**Replace BASE_URL** with your machine's LAN IP when testing on a physical device:
```js
export const BASE_URL = 'http://192.168.1.XXX:8000';
```

Usage in screens:
```js
import { apiFetch } from '../utils/api';

// Login
const data = await apiFetch('/api/v1/auth/login', {
  method: 'POST',
  body: JSON.stringify({ email, password }),
});
await AsyncStorage.setItem('access_token', data.access_token);

// Get cycle status (auto-attaches Bearer token)
const status = await apiFetch('/api/v1/cycle/status');
```

---

## Auth Flow

```
SplashScreen
    ↓
OnboardingScreen → POST /api/v1/onboarding (Bearer token)
    ↓
RegisterScreen → POST /api/v1/auth/register → { access_token, refresh_token, onboarding_complete }
    or
LoginScreen → POST /api/v1/auth/login → { access_token, refresh_token, onboarding_complete }
    ↓
HomeScreen (onboarding_complete: true)
```

Tokens are stored in AsyncStorage and auto-refreshed by `apiFetch`.
