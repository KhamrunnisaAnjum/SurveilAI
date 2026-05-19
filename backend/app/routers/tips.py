from fastapi import APIRouter, Query
from app.schemas.tip import HealthTipResponse

router = APIRouter(prefix="/api/tips", tags=["tips"])

HEALTH_TIPS = [
    {"en": "Stay Hydrated", "hi": "हाइड्रेटेड रहें", "body_en": "Drink at least 8 glasses of water daily.", "body_hi": "प्रतिदिन कम से कम 8 गिलास पानी पिएं।"},
    {"en": "Wash Hands", "hi": "हाथ धोएं", "body_en": "Regular hand washing prevents infections.", "body_hi": "नियमित हाथ धोने से संक्रमण रोकता है।"},
    {"en": "Vaccinate", "hi": "टीकाकरण", "body_en": "Ensure vaccinations are up to date.", "body_hi": "सुनिश्चित करें कि टीकाकरण अपडेट हैं।"},
    {"en": "Eat Balanced", "hi": "संतुलित आहार", "body_en": "Include fruits and vegetables in every meal.", "body_hi": "हर भोजन में फल और सब्जियां शामिल करें।"},
    {"en": "Exercise Daily", "hi": "रोज व्यायाम", "body_en": "30 minutes of walking daily improves health.", "body_hi": "प्रतिदिन 30 मिनट चलने से स्वास्थ्य बेहतर होता है।"},
]


@router.get("", response_model=list[HealthTipResponse])
async def get_tips(lang: str = Query("en"), limit: int = Query(5)):
    tips = []
    for i, tip in enumerate(HEALTH_TIPS[:limit]):
        tips.append({
            "id": i + 1,
            "title": tip.get(f"body_{lang}", tip["en"]),
            "body": tip.get(f"body_{lang}", tip["body_en"]),
            "lang": lang,
        })
    return tips
