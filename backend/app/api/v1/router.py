import sys, os 
print("======================")
print("======================")
print("DEBUG")
print(f"PREVIOUS PATH {sys.path}")
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), '..', '..', '..')))
print("======================")
print(f"UPDATED PATH {sys.path}")
print("======================")
print("======================")

from fastapi import APIRouter

from app.api.v1.endpoints import auth, onboarding, cycle

api_router = APIRouter(prefix="/api/v1")

api_router.include_router(auth.router)
api_router.include_router(onboarding.router)
api_router.include_router(cycle.router)
