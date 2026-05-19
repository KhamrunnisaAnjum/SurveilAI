import pytest
from fastapi.testclient import TestClient
from app.main import app

client = TestClient(app)


def test_health_check():
    response = client.get("/health")
    assert response.status_code == 200
    data = response.json()
    assert data["status"] == "healthy"


def test_request_otp():
    response = client.post("/api/auth/request-otp", json={"mobile_number": "9876543210"})
    assert response.status_code == 200


def test_verify_otp():
    response = client.post("/api/auth/verify-otp", json={"mobile_number": "9876543210", "otp": "123456"})
    assert response.status_code in [200, 404]


def test_get_tips():
    response = client.get("/api/tips?lang=en&limit=3")
    assert response.status_code == 200
    data = response.json()
    assert len(data) <= 3


def test_facilities_requires_auth():
    response = client.get("/api/facilities")
    assert response.status_code == 403


def test_clinical_requires_auth():
    response = client.get("/api/clinical/patients")
    assert response.status_code == 403


def test_alerts_requires_auth():
    response = client.get("/api/alerts")
    assert response.status_code == 403


def test_community_requires_auth():
    response = client.get("/api/community/reports")
    assert response.status_code == 403


def test_admin_requires_auth():
    response = client.get("/api/admin/users")
    assert response.status_code == 403
