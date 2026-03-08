from fastapi import APIRouter
from app.api.v1.endpoints import (
    auth,
    onboarding,
    cycle,
    symptoms,
    water,
    sleep,
    reminders,
    notifications,
    notification_settings,
    social_posts,
    social_comments,
    calendar_tasks,
)

api_router = APIRouter(prefix="/api/v1")

api_router.include_router(auth.router)
api_router.include_router(onboarding.router)
api_router.include_router(cycle.router)
api_router.include_router(symptoms.router)
api_router.include_router(water.router)
api_router.include_router(sleep.router)
api_router.include_router(reminders.router)
api_router.include_router(notifications.router)
api_router.include_router(notification_settings.router)
api_router.include_router(social_posts.router)
api_router.include_router(social_comments.router)
api_router.include_router(calendar_tasks.router)