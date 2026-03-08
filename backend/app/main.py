import sys, os
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), '..')))

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.api.v1.router import api_router
from app.db.session import engine, Base

import app.models.user
import app.models.onboarding
import app.models.cycle
import app.models.symptom_log
import app.models.water_log
import app.models.sleep_log
import app.models.reminder
import app.models.notification
import app.models.notification_settings
import app.models.social_post
import app.models.social_comment
import app.models.calendar_task

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


if __name__ == "__main__":
    import uvicorn
    uvicorn.run("app.main:app", host="0.0.0.0", port=8000, reload=True)