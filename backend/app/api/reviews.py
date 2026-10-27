from typing import List
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from sqlalchemy import desc
from app.db.session import get_db
from app.models.review import HumanReview
from app.models.assessment import Assessment
from app.models.alert import Alert
from app.schemas.review import HumanReviewCreate, HumanReviewResponse
from app.api.deps import require_reviewer
from app.services.audit_service import audit_service

router = APIRouter(prefix="/reviews", tags=["Human Reviews"])


@router.post("", response_model=HumanReviewResponse)
def submit_human_review(
    payload: HumanReviewCreate,
    db: Session = Depends(get_db),
    current_user = Depends(require_reviewer)
):
    assessment = db.query(Assessment).filter(Assessment.id == payload.assessment_id).first()
    if not assessment:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Assessment '{payload.assessment_id}' not found."
        )

    review = HumanReview(
        assessment_id=assessment.id,
        reviewer_id=current_user.id,
        reviewer_name=current_user.full_name,
        reviewer_role=current_user.role,
        decision=payload.decision,
        notes=payload.notes,
        recommendations=payload.recommendations,
        referral_target=payload.referral_target
    )
    db.add(review)

    # Update assessment status based on decision
    if payload.decision == "closed":
        assessment.status = "closed"
    elif payload.decision == "request_followup":
        assessment.status = "follow_up_required"
    else:
        assessment.status = "reviewed"

    # Also mark active alerts for this assessment as acknowledged or resolved
    alerts = db.query(Alert).filter(Alert.assessment_id == assessment.id, Alert.status == "active").all()
    for alert in alerts:
        alert.status = "resolved"
        alert.resolved_by = current_user.full_name

    db.commit()
    db.refresh(review)
    db.refresh(assessment)

    audit_service.log(
        db,
        action="HUMAN_REVIEW_SUBMITTED",
        resource_type="HumanReview",
        resource_id=review.id,
        user_id=current_user.id,
        user_role=current_user.role,
        details={
            "assessment_id": assessment.id,
            "decision": payload.decision,
            "referral_target": payload.referral_target
        }
    )

    return HumanReviewResponse.model_validate(review)


@router.get("/assessment/{assessment_id}", response_model=List[HumanReviewResponse])
def get_reviews_for_assessment(assessment_id: str, db: Session = Depends(get_db)):
    reviews = db.query(HumanReview).filter(
        HumanReview.assessment_id == assessment_id
    ).order_by(desc(HumanReview.created_at)).all()
    return [HumanReviewResponse.model_validate(r) for r in reviews]
