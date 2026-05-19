import json
import os
import joblib
import numpy as np
from datetime import datetime
from typing import Dict, Tuple
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, func
from app.models import Patient, Vital, RiskScore
from app.config import get_settings
from app.utils.otp import cache_risk_score, get_cached_risk_score

settings = get_settings()

_model = None
_imputer = None


def load_model():
    global _model, _imputer
    if _model is None and os.path.exists(settings.MODEL_PATH):
        data = joblib.load(settings.MODEL_PATH)
        _model = data["model"]
        _imputer = data.get("imputer")
    return _model is not None


def compute_risk_score(
    age: int,
    gender: str,
    vitals: Dict,
    admission_days: int,
    symptom_severity_avg: float = 0,
) -> Tuple[float, Dict[str, float]]:
    model = load_model()
    if not model:
        return _fallback_score(age, vitals), {}

    features = _extract_features(age, gender, vitals, admission_days, symptom_severity_avg)
    score = float(model.predict_proba([features])[0][1] * 100)

    try:
        import shap
        explainer = shap.TreeExplainer(model)
        shap_values = explainer.shap_values([features])
        feature_names = ["age", "gender", "hr", "spo2", "temp", "sys", "dia", "rr", "days", "severity"]
        shap_dict = {name: float(val) for name, val in zip(feature_names, shap_values[0])}
    except Exception:
        shap_dict = {}

    return round(score, 2), shap_dict


def _extract_features(age, gender, vitals, admission_days, severity):
    return [
        age,
        1 if gender == "male" else 0,
        vitals.get("heart_rate", 80),
        vitals.get("spo2", 98),
        vitals.get("temperature", 37),
        vitals.get("bp_systolic", 120),
        vitals.get("bp_diastolic", 80),
        vitals.get("respiratory_rate", 16),
        admission_days,
        severity,
    ]


def _fallback_score(age: int, vitals: Dict) -> float:
    score = 0
    hr = vitals.get("heart_rate", 80)
    if hr > 100 or hr < 60:
        score += 15
    spo2 = vitals.get("spo2", 98)
    if spo2 < 95:
        score += 25
    temp = vitals.get("temperature", 37)
    if temp > 38:
        score += 20
    sys = vitals.get("bp_systolic", 120)
    if sys > 140 or sys < 90:
        score += 15
    if age > 60:
        score += 10
    return min(score, 100)


async def recalculate_patient_risk(db: AsyncSession, patient_id: str) -> RiskScore | None:
    cached = get_cached_risk_score(patient_id)
    if cached:
        return RiskScore(
            patient_id=patient_id,
            score=cached["score"],
            shap_values=cached["shap_values"],
            computed_at=datetime.utcnow(),
        )

    patient = await db.get(Patient, patient_id)
    if not patient:
        return None

    vitals_stmt = select(Vital).where(Vital.patient_id == patient_id).order_by(Vital.recorded_at.desc()).limit(1)
    vitals_result = await db.execute(vitals_stmt)
    latest_vital = vitals_result.scalar_one_or_none()

    vitals_dict = {}
    if latest_vital:
        vitals_dict = {
            "heart_rate": latest_vital.heart_rate,
            "spo2": latest_vital.spo2,
            "temperature": latest_vital.temperature,
            "bp_systolic": latest_vital.bp_systolic,
            "bp_diastolic": latest_vital.bp_diastolic,
            "respiratory_rate": latest_vital.respiratory_rate,
        }

    admission_days = (datetime.utcnow().date() - patient.admission_date).days if patient.admission_date else 0

    score, shap_values = compute_risk_score(
        age=patient.age,
        gender=patient.gender,
        vitals=vitals_dict,
        admission_days=admission_days,
    )

    cache_risk_score(patient_id, score, shap_values)

    risk_record = RiskScore(
        patient_id=patient_id,
        score=score,
        shap_values=shap_values,
        computed_at=datetime.utcnow(),
        model_version="v1.0",
    )
    db.add(risk_record)
    await db.commit()
    await db.refresh(risk_record)
    return risk_record
