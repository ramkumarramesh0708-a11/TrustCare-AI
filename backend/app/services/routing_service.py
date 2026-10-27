from datetime import datetime, timedelta
from typing import Optional, Tuple
from sqlalchemy.orm import Session
from app.models.assessment import Assessment
from app.models.alert import Alert
from app.models.review import FollowUpRecord


class RoutingEngine:
    """
    Shared risk routing and alert triage engine.
    Applies domain-specific thresholds and rule evaluation to route
    assessments to appropriate clinical review queues and follow-up streams.
    """

    @staticmethod
    def evaluate_and_route(db: Session, assessment: Assessment, inference_result: dict) -> Tuple[Assessment, Optional[Alert]]:
        risk_level = inference_result.get("risk_level", "low")
        module_id = assessment.module_id
        alert = None

        if risk_level == "urgent":
            assessment.status = "pending_review"
            trigger_reason = f"Urgent safety/clinical priority triggered by {module_id} assessment: {inference_result.get('outcome_summary')}"
            alert = Alert(
                assessment_id=assessment.id,
                module_id=module_id,
                alert_type="CRITICAL_SAFETY_OR_CLINICAL_ALERT",
                severity="critical",
                trigger_reason=trigger_reason,
                status="active",
                simulated=True
            )
            db.add(alert)

            # Auto-schedule high-priority follow-up check within 24 hours
            follow_up = FollowUpRecord(
                assessment_id=assessment.id,
                due_date=datetime.utcnow() + timedelta(days=1),
                status="pending",
                note=f"High-priority urgent review follow-up for {assessment.subject_ref}.",
                contact_channel="urgent_triage"
            )
            db.add(follow_up)

        elif risk_level == "high":
            assessment.status = "pending_review"
            trigger_reason = f"Elevated risk score flagged in {module_id} requiring qualified human review."
            alert = Alert(
                assessment_id=assessment.id,
                module_id=module_id,
                alert_type="HIGH_RISK_REVIEW_REQUIRED",
                severity="warning",
                trigger_reason=trigger_reason,
                status="active",
                simulated=True
            )
            db.add(alert)

            # Schedule follow-up within 7 days
            follow_up = FollowUpRecord(
                assessment_id=assessment.id,
                due_date=datetime.utcnow() + timedelta(days=7),
                status="pending",
                note=f"Clinical follow-up check-in for {assessment.subject_ref}.",
                contact_channel="clinical_portal"
            )
            db.add(follow_up)

        elif risk_level == "moderate":
            assessment.status = "submitted"
            # Info level notice
            alert = Alert(
                assessment_id=assessment.id,
                module_id=module_id,
                alert_type="MODERATE_MONITORING_NOTICE",
                severity="info",
                trigger_reason=f"Moderate symptoms recorded. Routine review and tracking indicated.",
                status="active",
                simulated=True
            )
            db.add(alert)

        else:
            assessment.status = "submitted"

        db.commit()
        db.refresh(assessment)
        if alert:
            db.refresh(alert)

        return assessment, alert


routing_engine = RoutingEngine()
