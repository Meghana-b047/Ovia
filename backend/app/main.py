"""
Ovia Backend — FastAPI Application
===================================
Serves the API for:
  • CalendarScreen  → /tasks  + /cycle
  • ExerciseScreen  → /exercises/modules  + /exercises/categories
  • ExerciseDetailScreen → /exercises/modules/{id}/videos + /exercises/progress
  • Auth            → /auth/register  /auth/login  /auth/me

Run locally:
    uvicorn main:app --reload --port 8000

Interactive docs:
    http://localhost:8000/docs
"""

from contextlib import asynccontextmanager

from fastapi import FastAPI

from core.database import init_db
from middleware.cors import add_cors
from routers import auth, tasks, cycle, exercises


@asynccontextmanager
async def lifespan(app: FastAPI):
    # ── Startup ──
    await init_db()
    yield
    # ── Shutdown ── (nothing to clean up for SQLite)


app = FastAPI(
    title="Ovia API",
    description="Backend for CalendarScreen, ExerciseScreen, and ExerciseDetailScreen",
    version="1.0.0",
    lifespan=lifespan,
)

# ── Middleware ────────────────────────────────────────────────────────────────
add_cors(app)

# ── Routers ───────────────────────────────────────────────────────────────────
app.include_router(auth.router,       prefix="/api/v1")
app.include_router(tasks.router,      prefix="/api/v1")
app.include_router(cycle.router,      prefix="/api/v1")
app.include_router(exercises.router,  prefix="/api/v1")


# ── Health check ──────────────────────────────────────────────────────────────
@app.get("/health", tags=["Health"])
async def health():
    return {"status": "ok", "service": "ovia-api"}
