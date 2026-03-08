import sys, os
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), '..')))


from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.api.v1.router import api_router
from app.db.session import engine, Base

# Register all models with SQLAlchemy before creating tables
import app.models.user                  # noqa
import app.models.onboarding            # noqa
import app.models.cycle
import app.models.symptom_log           # noqa
import app.models.water_log             # noqa
import app.models.sleep_log             # noqa
import app.models.reminder              # noqa
import app.models.notification          # noqa
import app.models.notification_settings # noqa
import app.models.social_post           # noqa
import app.models.social_comment        # noqa
import app.models.calendar_task         # noqa

Base.metadata.create_all(bind=engine)

app = FastAPI(
    title="Ovia Health API",
    description="Backend for the Ovia period & women's health tracking app",
    version="1.0.0",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(api_router)


@app.get("/")
def root():
    return {"message": "Ovia API is running 🌸"}


@app.get("/health")
def health():
    return {"status": "ok"}