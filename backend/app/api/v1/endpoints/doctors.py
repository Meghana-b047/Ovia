from fastapi import APIRouter, Depends, Query
from pydantic import BaseModel
from typing import List, Optional
import math

from app.core.dependencies import get_current_user
from app.models.user import User

router = APIRouter(prefix="/doctors", tags=["Doctors"])


class DoctorResult(BaseModel):
    name: str
    specialty: str
    address: str
    distance_km: Optional[float]
    rating: Optional[float]
    phone: Optional[str]
    maps_url: str


class DoctorsResponse(BaseModel):
    doctors: List[DoctorResult]
    search_url: str   # Google Maps search URL the app can open


@router.get("", response_model=DoctorsResponse)
async def find_doctors(
    latitude: float = Query(..., description="User's current latitude"),
    longitude: float = Query(..., description="User's current longitude"),
    specialty: str = Query(default="gynaecologist", description="Type of doctor to search for"),
    current_user: User = Depends(get_current_user),
):
    """
    Returns a Google Maps search URL and a deep-link that opens
    the Maps app on the user's phone, pre-filled with nearby doctors.

    The frontend should:
    1. Call this endpoint with the user's GPS coordinates
    2. Display the maps_url as a button → opens Google Maps app on phone
    3. Optionally show the fallback doctor list returned here

    To get REAL doctor listings, integrate the Google Places API:
    - Endpoint: https://maps.googleapis.com/maps/api/place/nearbysearch/json
    - Params: location={lat},{lng}&radius=5000&type=doctor&keyword={specialty}&key=YOUR_KEY
    """

    # Build Google Maps search URL — works on both web and mobile
    query = f"{specialty} near me"
    encoded_query = query.replace(" ", "+")
    maps_search_url = (
        f"https://www.google.com/maps/search/{encoded_query}"
        f"/@{latitude},{longitude},14z"
    )

    # Deep link that opens the native Maps app on Android/iOS
    maps_deep_link = f"geo:{latitude},{longitude}?q={encoded_query}"

    # Fallback static list (replace with Google Places API for real data)
    fallback_doctors = [
        DoctorResult(
            name="Search on Google Maps",
            specialty=specialty.title(),
            address="Tap to find doctors near your location",
            distance_km=None,
            rating=None,
            phone=None,
            maps_url=maps_search_url,
        )
    ]

    return DoctorsResponse(
        doctors=fallback_doctors,
        search_url=maps_search_url,
    )
