import pytest
from fastapi.testclient import TestClient
from app.main import app
from app.core.security import create_access_token

client = TestClient(app)


def test_health_check():
    response = client.get("/api/health")
    assert response.status_code == 200
    data = response.json()
    assert data["status"] == "healthy"
    assert data["service"] == "AEGIS AI"


def test_get_modules():
    response = client.get("/api/modules")
    assert response.status_code == 200
    modules = response.json()
    assert len(modules) >= 6
    module_ids = [m["id"] for m in modules]
    assert "mental_wellness" in module_ids
    assert "trauma_support" in module_ids
    assert "retinal_screening" in module_ids
    assert "joint_health" in module_ids
    assert "cognitive_screening" in module_ids
    assert "livestock_health" in module_ids


def test_get_invalid_module():
    response = client.get("/api/modules/non_existent_module_999")
    assert response.status_code == 404


def test_submit_assessment_missing_consent():
    payload = {
        "module_id": "mental_wellness",
        "raw_inputs": {"stress_level": 5, "sleep_hours": 7, "functioning_difficulty": 2},
        "consent_given": False
    }
    response = client.post("/api/assessments", json=payload)
    assert response.status_code == 400
    assert "consent" in response.json()["detail"].lower()


def test_submit_mental_wellness_assessment():
    payload = {
        "module_id": "mental_wellness",
        "raw_inputs": {
            "stress_level": 7,
            "sleep_hours": 5.0,
            "sleep_quality": 2,
            "mood_rating": 3,
            "functioning_difficulty": 3,
            "social_connection": 3,
            "crisis_thoughts": False
        },
        "consent_given": True
    }
    response = client.post("/api/assessments", json=payload)
    assert response.status_code == 200
    data = response.json()
    assert "id" in data
    assert data["module_id"] == "mental_wellness"
    assert data["risk_level"] in ["moderate", "high"]
    assert data["explanation"] is not None
    assert len(data["explanation"]["factor_contributions"]) > 0
    assert data["explanation"]["explanation_method"] == "SHAP-aligned Feature Contributions"


def test_trauma_support_optional_questions():
    # In trauma-informed care, all questions are optional
    payload = {
        "module_id": "trauma_support",
        "raw_inputs": {
            "safety_status": "not_specified",
            "support_preferences": ["confidential_counseling"],
            "skipped_questions_count": 2
        },
        "consent_given": True
    }
    response = client.post("/api/assessments", json=payload)
    assert response.status_code == 200
    data = response.json()
    assert data["module_id"] == "trauma_support"
    assert data["risk_level"] == "low"
    assert data["explanation"] is not None


def test_retinal_screening_invalid_file_extension():
    payload = {
        "module_id": "retinal_screening",
        "raw_inputs": {
            "image_filename": "malicious_script.exe",
            "image_size_bytes": 1024
        },
        "consent_given": True
    }
    response = client.post("/api/assessments", json=payload)
    assert response.status_code == 422
    data = response.json()
    assert "detail" in data


def test_retinal_screening_valid_pipeline():
    payload = {
        "module_id": "retinal_screening",
        "raw_inputs": {
            "image_filename": "fundus_scan_left_eye.jpg",
            "image_size_bytes": 2048000,
            "eye_side": "Left Eye (OS)",
            "diabetes_duration_years": 8,
            "run_demo_simulation": True
        },
        "consent_given": True,
        "attachment_data": {"filename": "fundus_scan_left_eye.jpg", "size": 2048000}
    }
    response = client.post("/api/assessments", json=payload)
    assert response.status_code == 200
    data = response.json()
    assert data["has_file_attachment"] is True
    assert "Grad-CAM" in data["explanation"]["explanation_method"]


def test_livestock_health_assessment():
    payload = {
        "module_id": "livestock_health",
        "raw_inputs": {
            "animal_species": "Cattle",
            "symptom_duration_days": 4,
            "appetite_status": "completely_off_feed",
            "fever_suspected_or_measured": True,
            "respiratory_distress": True,
            "severe_lethargy_or_down": True,
            "herd_affected_count": 8
        },
        "consent_given": True
    }
    response = client.post("/api/assessments", json=payload)
    assert response.status_code == 200
    data = response.json()
    assert data["risk_level"] == "urgent"
    assert data["status"] == "pending_review"
    assert data["alerts_count"] >= 1


def test_list_alerts_and_patch():
    # List alerts
    response = client.get("/api/alerts")
    assert response.status_code == 200
    alerts = response.json()
    assert len(alerts) > 0
    alert_id = alerts[0]["id"]

    # Patch alert
    patch_res = client.patch(f"/api/alerts/{alert_id}", json={"status": "acknowledged"})
    assert patch_res.status_code == 200
    assert patch_res.json()["status"] == "acknowledged"


def test_human_review_unauthorized():
    # Attempting to submit review without token should be 401
    payload = {
        "assessment_id": "some-id",
        "decision": "concur",
        "notes": "Looks consistent."
    }
    response = client.post("/api/reviews", json=payload)
    assert response.status_code == 401


def test_human_review_authorized_and_status_update():
    # Get an assessment
    assessments_res = client.get("/api/assessments?status=pending_review")
    assert assessments_res.status_code == 200
    assessments = assessments_res.json()
    assert len(assessments) > 0
    target_id = assessments[0]["id"]

    # Login as reviewer
    login_res = client.post("/api/auth/login", json={"username": "dr.chen", "password": "doctor123"})
    assert login_res.status_code == 200
    token = login_res.json()["access_token"]

    review_payload = {
        "assessment_id": target_id,
        "decision": "refer_specialist",
        "notes": "Reviewed indicators. Referral to specialist arranged.",
        "referral_target": "Regional Clinic"
    }
    review_res = client.post(
        "/api/reviews",
        json=review_payload,
        headers={"Authorization": f"Bearer {token}"}
    )
    assert review_res.status_code == 200
    review_data = review_res.json()
    assert review_data["decision"] == "refer_specialist"
    assert review_data["reviewer_name"] == "Dr. Evelyn Chen, MD (Reviewer)"

    # Verify assessment status updated to reviewed
    detail_res = client.get(f"/api/assessments/{target_id}")
    assert detail_res.status_code == 200
    assert detail_res.json()["status"] == "reviewed"


def test_models_registry_listing():
    response = client.get("/api/models")
    assert response.status_code == 200
    models = response.json()
    assert len(models) >= 6
    keys = [m["model_key"] for m in models]
    assert "aegis_mw_v1" in keys
    assert "aegis_retinanet_v09" in keys


def test_stats_overview():
    response = client.get("/api/stats/overview")
    assert response.status_code == 200
    stats = response.json()
    assert stats["total_assessments"] > 0
    assert len(stats["status_distribution"]) > 0
    assert len(stats["risk_distribution"]) > 0


def test_get_assessment_by_id_and_explanation():
    res = client.get("/api/assessments?limit=1")
    assert res.status_code == 200
    items = res.json()
    assert len(items) > 0
    aid = items[0]["id"]

    detail_res = client.get(f"/api/assessments/{aid}")
    assert detail_res.status_code == 200
    assert detail_res.json()["id"] == aid

    exp_res = client.get(f"/api/assessments/{aid}/explanation")
    assert exp_res.status_code == 200
    assert exp_res.json()["assessment_id"] == aid


def test_get_assessment_not_found():
    res = client.get("/api/assessments/non-existent-uuid-999")
    assert res.status_code == 404


def test_submit_joint_health_assessment():
    payload = {
        "module_id": "joint_health",
        "raw_inputs": {
            "joint_location": "Right Knee",
            "pain_severity": 6,
            "morning_stiffness_minutes": 35,
            "swelling_observed": True,
            "crepitus_grating_sound": True,
            "walking_limitation_blocks": 2
        },
        "consent_given": True
    }
    res = client.post("/api/assessments", json=payload)
    assert res.status_code == 200
    data = res.json()
    assert data["module_id"] == "joint_health"
    assert data["risk_level"] in ["moderate", "high"]
    assert data["explanation"] is not None


def test_submit_cognitive_screening_assessment():
    payload = {
        "module_id": "cognitive_screening",
        "raw_inputs": {
            "word_recall_score": 1,
            "orientation_score": 3,
            "clock_draw_score": 2,
            "memory_decline_concern_months": 14,
            "daily_function_impact": True
        },
        "consent_given": True
    }
    res = client.post("/api/assessments", json=payload)
    assert res.status_code == 200
    data = res.json()
    assert data["module_id"] == "cognitive_screening"
    assert data["risk_level"] in ["moderate", "high", "urgent"]
    assert data["explanation"] is not None


def test_list_follow_ups():
    res = client.get("/api/follow-ups")
    assert res.status_code == 200
    assert isinstance(res.json(), list)


def test_list_audit_logs():
    res = client.get("/api/audit-logs")
    assert res.status_code == 200
    assert isinstance(res.json(), list)


def test_auth_invalid_credentials():
    res = client.post("/api/auth/login", json={"username": "wronguser", "password": "wrongpassword"})
    assert res.status_code == 401

