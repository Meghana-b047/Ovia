from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from pydantic import BaseModel
from typing import List
import datetime

from app.core.dependencies import get_db, get_current_user
from app.models.user import User
from app.models.onboarding import OnboardingProfile
from app.models.cycle import CycleLog

router = APIRouter(prefix="/chatbot", tags=["Chatbot"])


class ChatMessage(BaseModel):
    role: str   # "user" or "assistant"
    content: str


class ChatRequest(BaseModel):
    message: str
    history: List[ChatMessage] = []


class ChatResponse(BaseModel):
    reply: str


# ── Simple rule-based health chatbot ─────────────────────────────────────────
# Replace the _get_bot_reply function body with an LLM API call
# (OpenAI / Anthropic / Google) when you have an API key.

GREETINGS = ["hi", "hello", "hey", "hii", "helo"]

RESPONSES = {
    # Cycle
    "period": "🩸 Your period (menstrual phase) is days 1–5 of your cycle. Rest, stay hydrated, and eat iron-rich foods like spinach and lentils. Gentle yoga or walking can ease cramps.",
    "cramps": "💊 For cramps try a heating pad, light stretching, or ibuprofen. Magnesium-rich foods like dark chocolate and nuts can also help! If cramps are severe, see a doctor.",
    "cycle": "📅 A typical cycle is 21–35 days. Tracking it helps predict your next period and ovulation window. Have you logged your last period in the app yet?",
    "ovulation": "🌸 Ovulation usually happens around day 14 of a 28-day cycle. You're most fertile in the 5 days before and the day of ovulation. Track cervical mucus and basal body temperature for accuracy.",
    "fertile": "🌸 Your fertile window is typically 5 days before ovulation and the day of ovulation itself. If your cycle is 28 days, that's roughly days 10–15.",
    "late period": "⏰ A late period can be caused by stress, weight changes, illness, or hormonal shifts. If it's more than 7 days late and you're sexually active, consider taking a pregnancy test.",
    "irregular": "⚠️ Irregular cycles can be caused by stress, PCOS, thyroid issues, or major weight changes. Logging your symptoms in the app helps identify patterns. See a gynaecologist if it persists.",

    # PCOS
    "pcos": "🔬 PCOS (Polycystic Ovary Syndrome) is a hormonal condition. Symptoms include irregular periods, acne, hair growth, and weight gain. A low-GI diet, regular exercise, and medical support can help manage it.",
    "pcod": "🔬 PCOD and PCOS are related but different. PCOD involves releasing immature eggs; PCOS is a metabolic disorder. Both benefit from a healthy lifestyle and gynaecologist guidance.",

    # Pregnancy
    "pregnant": "🤰 If you think you're pregnant, take a home pregnancy test on the first day of your missed period. For reliable results, use first morning urine. Consult a doctor to confirm.",
    "pregnancy": "🤰 Early pregnancy signs include a missed period, nausea, tender breasts, and fatigue. Take a home test and see your doctor for confirmation and prenatal care.",
    "due date": "📆 Your due date is estimated as 40 weeks from your last menstrual period (LMP). Use the app's pregnancy module to track week-by-week milestones.",

    # Nutrition
    "food": "🥗 During your menstrual phase, eat iron-rich foods (spinach, beans). In the follicular phase, focus on lean proteins. Around ovulation, eat antioxidants like berries. In the luteal phase, complex carbs like sweet potato help with mood.",
    "diet": "🥗 Cycle syncing your diet can really help! Iron + Vitamin C during your period, protein during follicular, antioxidants around ovulation, and complex carbs in the luteal phase.",
    "iron": "🥬 Good iron sources include spinach, lentils, red meat, tofu, and fortified cereals. Eat them with Vitamin C (like orange juice) to boost absorption.",

    # Exercise
    "exercise": "🏃 In the menstrual phase, try yoga or walking. Follicular phase is great for jogging or hiking. Ovulation is your peak energy — HIIT and strength training work best. In the luteal phase, ease back to lighter workouts.",
    "workout": "💪 Your best workouts depend on your cycle phase! High-intensity exercise is most effective around ovulation. During your period, gentle movement is better — your body needs rest.",

    # Mood
    "mood": "💆 Mood changes throughout your cycle are normal. Low estrogen before your period can cause irritability. Magnesium, omega-3s, and regular sleep can help stabilise mood.",
    "stress": "🧘 Stress can actually delay your period by affecting the hormones that trigger ovulation. Meditation, sleep, and gentle exercise can help regulate your cycle.",
    "anxiety": "💙 Hormonal fluctuations can increase anxiety, especially in the luteal phase. Deep breathing, reducing caffeine, and gentle movement can help. Consider speaking to a professional if it's persistent.",

    # Symptoms
    "bloating": "🫧 Bloating before your period is caused by progesterone. Reduce salt, avoid carbonated drinks, and try peppermint tea. It usually goes away once your period starts.",
    "acne": "✨ Hormonal acne is common before your period when progesterone spikes. A gentle skincare routine, reducing sugar, and staying hydrated can help.",
    "headache": "🤕 Headaches around your period are often caused by dropping estrogen. Stay hydrated, avoid skipping meals, and rest. Magnesium supplements may help.",
    "discharge": "💧 Vaginal discharge changes throughout your cycle — it's normal. Clear and stretchy around ovulation, thick and white in the luteal phase. See a doctor if it's yellow, grey, or has a strong smell.",

    # Doctors
    "doctor": "🏥 Use the 'Find Doctors' feature in the app to locate gynaecologists near you! Regular check-ups are recommended at least once a year.",
    "gynaecologist": "👩‍⚕️ You should see a gynaecologist if you have severe cramps, very irregular cycles, unusual discharge, or are planning a pregnancy. The app's doctor finder can help locate one near you.",
}


def _get_bot_reply(message: str, user_name: str, cycle_day: int = None) -> str:
    msg = message.lower().strip()

    # Greetings
    if any(g in msg for g in GREETINGS):
        return f"Hi {user_name}! 🌸 I'm Ovia, your personal health assistant. Ask me anything about your cycle, PCOS, nutrition, exercise, or mood!"

    # Check keywords
    for keyword, response in RESPONSES.items():
        if keyword in msg:
            return response

    # Context-aware reply using cycle day
    if cycle_day and any(w in msg for w in ["today", "how am i", "what phase", "my cycle"]):
        if cycle_day <= 5:
            return f"📅 You're on day {cycle_day} of your cycle — that's your menstrual phase. Rest up, stay warm, and eat iron-rich foods. 🩸"
        elif cycle_day <= 13:
            return f"📅 You're on day {cycle_day} — your follicular phase! Energy is rising. Great time for cardio and protein-rich meals. 🚴"
        elif cycle_day <= 16:
            return f"📅 You're on day {cycle_day} — around ovulation! Peak energy and fertility window. Perfect for high-intensity workouts. 💪"
        else:
            return f"📅 You're on day {cycle_day} — your luteal phase. Energy may dip. Eat complex carbs and do lighter workouts. 🧘"

    # Default fallback
    return (
        f"I'm here to help with your health journey, {user_name}! 🌸 "
        "You can ask me about your cycle, PCOS, pregnancy, nutrition, exercise, or mood. "
        "For medical concerns, I always recommend seeing a doctor. 💙"
    )


@router.post("", response_model=ChatResponse)
async def chat(
    req: ChatRequest,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """
    Health chatbot endpoint.
    Responds to cycle, PCOS, pregnancy, nutrition, and mood questions.
    Personalises replies using the user's current cycle day if available.
    """
    # Try to get current cycle day for context
    cycle_day = None
    try:
        from sqlalchemy import desc
        logs_result = await db.execute(
            select(CycleLog)
            .where(CycleLog.user_id == current_user.id)
            .order_by(desc(CycleLog.period_start_date))
            .limit(1)
        )
        latest_log = logs_result.scalar_one_or_none()
        if latest_log:
            cycle_day = (datetime.date.today() - latest_log.period_start_date).days + 1
    except Exception:
        pass

    first_name = current_user.full_name.split()[0] if current_user.full_name else "there"
    reply = _get_bot_reply(req.message, first_name, cycle_day)

    return ChatResponse(reply=reply)
