import sys, os 
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), '..')))

from contextlib import asynccontextmanager

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.core.config import settings
from app.api.v1.router import api_router
from app.db.session import engine, Base

# Import all models so Alembic/SQLAlchemy can detect them
from app.models import user, onboarding, cycle  # noqa: F401

@asynccontextmanager
async def lifespan(app: FastAPI):
    # On startup: create tables (dev only — use Alembic in production)
    if settings.APP_ENV == "development":
        async with engine.begin() as conn:
            await conn.run_sync(Base.metadata.create_all)
    yield
    # On shutdown: dispose DB engine
    await engine.dispose()


app = FastAPI(
    title=f"{settings.APP_NAME} API",
    description="Backend for the Ovia FemTech app — cycle tracking, onboarding, auth, and more.",
    version="1.0.0",
    docs_url="/docs",
    redoc_url="/redoc",
    lifespan=lifespan,
)

# ── CORS ──────────────────────────────────────────────────────────────────────
app.add_middleware(
    CORSMiddleware,
    allow_origins=[settings.FRONTEND_URL, "http://localhost:8081", "exp://"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ── Routes ────────────────────────────────────────────────────────────────────
app.include_router(api_router)


@app.get("/", tags=["Health"])
async def root():
    return {"status": "ok", "app": settings.APP_NAME, "version": "1.0.0"}


@app.get("/health", tags=["Health"])
async def health_check():
    return {"status": "healthy"}

if __name__ == "__main__":
    import sys
    import uvicorn

    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)