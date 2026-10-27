import uuid
import random
from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.orm import Session
from sqlalchemy import desc
from app.db.session import get_db
from app.models.assessment import Assessment, AssessmentExplanation
from app.models.consent import ConsentRecord
from app.models.alert import Alert
from app.models.review import HumanReview
from app.schemas.assessment import AssessmentCreate, AssessmentResponse, AssessmentSummary
from app.schemas.explanation import ExplanationResponse
from app.modules.registry import module_registry
from app.services.routing_service import routing_engine
from app.services.audit_service import audit_service
from app.api.deps import get_current_user_optional

router = APIRouter(prefix="/assessments", tags=["Assessments"])


def generate_pseudonymous_subject_ref() -> str:
    return f"SUBJ-{random.randint(1000, 9999)}"


@router.post("", response_model=AssessmentResponse)
def submit_assessment(
    payload: AssessmentCreate,
    db: Session = Depends(get_db),
    current_user = Depends(get_current_user_optional)
):
    if not payload.consent_given:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Assessment processing requires informed consent. Please check the consent acknowledgment."
        )

    adapter = module_registry.get(payload.module_id)
    if not adapter:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Screening module '{payload.module_id}' does not exist or is inactive."
        )

    # Validate inputs with module adapter
    is_valid, validation_errors = adapter.validate_inputs(payload.raw_inputs)
    if not is_valid:
        raise HTTPException(
            status_code=status.HTTP_422_UNPROCESSABLE_CONTENT,
            detail={"message": "Input validation failed for this screening domain", "errors": validation_errors}
        )

    subject_ref = payload.subject_ref or generate_pseudonymous_subject_ref()
    user_id = current_user.id if current_user else None

    # Record consent
    consent = ConsentRecord(
        user_id=user_id,
        subject_ref=subject_ref,
        module_id=payload.module_id,
        consent_type="screening_assessment_processing",
        consented=True,
        ip_hash="sha256-pseudonymous-origin"
    )
    db.add(consent)

    # Run modular inference
    result = adapter.infer(payload.raw_inputs)

    # Create Assessment entity
    has_attachment = payload.attachment_data is not None
    assessment = Assessment(
        user_id=user_id,
        subject_ref=subject_ref,
        module_id=payload.module_id,
        status="submitted",
        risk_level=result["risk_level"],
        confidence_score=result["confidence_score"],
        outcome_summary=result["outcome_summary"],
        raw_inputs=payload.raw_inputs,
        has_file_attachment=has_attachment,
        attachment_metadata=payload.attachment_data
    )
    db.add(assessment)
    db.flush()

    # Create Explanation entity
    explanation = AssessmentExplanation(
        assessment_id=assessment.id,
        model_name=result.get("model_name", adapter.model_name),
        model_version=result.get("model_version", adapter.model_version),
        validation_status=result["validation_status"],
        explanation_method=result["explanation_method"],
        factor_contributions=result["factor_contributions"],
        limitations=result["limitations"],
        missing_inputs=result.get("missing_inputs", []),
        human_review_recommended=result["human_review_recommended"]
    )
    db.add(explanation)
    db.flush()

    # Shared routing engine handles thresholds and alert creation
    assessment, alert = routing_engine.evaluate_and_route(db, assessment, result)

    # Audit log
    audit_service.log(
        db,
        action="ASSESSMENT_SUBMITTED",
        resource_type="Assessment",
        resource_id=assessment.id,
        user_id=user_id,
        user_role=current_user.role if current_user else "anonymous",
        details={
            "module_id": assessment.module_id,
            "subject_ref": subject_ref,
            "risk_level": assessment.risk_level,
            "alert_created": alert is not None
        }
    )

    alerts_count = db.query(Alert).filter(Alert.assessment_id == assessment.id).count()
    reviews_count = db.query(HumanReview).filter(HumanReview.assessment_id == assessment.id).count()

    response_data = AssessmentResponse(
        id=assessment.id,
        user_id=assessment.user_id,
        subject_ref=assessment.subject_ref,
        module_id=assessment.module_id,
        status=assessment.status,
        risk_level=assessment.risk_level,
        confidence_score=assessment.confidence_score,
        outcome_summary=assessment.outcome_summary,
        raw_inputs=assessment.raw_inputs,
        has_file_attachment=assessment.has_file_attachment,
        attachment_metadata=assessment.attachment_metadata,
        created_at=assessment.created_at,
        updated_at=assessment.updated_at,
        explanation=ExplanationResponse.model_validate(explanation),
        alerts_count=alerts_count,
        reviews_count=reviews_count
    )

    return response_data


@router.get("", response_model=List[AssessmentSummary])
def list_assessments(
    module_id: Optional[str] = Query(None),
    status: Optional[str] = Query(None),
    risk_level: Optional[str] = Query(None),
    search: Optional[str] = Query(None),
    skip: int = Query(0, ge=0),
    limit: int = Query(50, ge=1, le=200),
    db: Session = Depends(get_db)
):
    query = db.query(Assessment)

    if module_id:
        query = query.filter(Assessment.module_id == module_id)
    if status:
        query = query.filter(Assessment.status == status)
    if risk_level:
        query = query.filter(Assessment.risk_level == risk_level)
    if search:
        query = query.filter(Assessment.subject_ref.ilike(f"%{search}%"))

    assessments = query.order_by(desc(Assessment.created_at)).offset(skip).limit(limit).all()
    return [AssessmentSummary.model_validate(a) for a in assessments]


@router.get("/{assessment_id}", response_model=AssessmentResponse)
def get_assessment(assessment_id: str, db: Session = Depends(get_db)):
    assessment = db.query(Assessment).filter(Assessment.id == assessment_id).first()
    if not assessment:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Assessment '{assessment_id}' not found."
        )

    alerts_count = db.query(Alert).filter(Alert.assessment_id == assessment.id).count()
    reviews_count = db.query(HumanReview).filter(HumanReview.assessment_id == assessment.id).count()

    exp_data = None
    if assessment.explanation:
        exp_data = ExplanationResponse.model_validate(assessment.explanation)

    return AssessmentResponse(
        id=assessment.id,
        user_id=assessment.user_id,
        subject_ref=assessment.subject_ref,
        module_id=assessment.module_id,
        status=assessment.status,
        risk_level=assessment.risk_level,
        confidence_score=assessment.confidence_score,
        outcome_summary=assessment.outcome_summary,
        raw_inputs=assessment.raw_inputs,
        has_file_attachment=assessment.has_file_attachment,
        attachment_metadata=assessment.attachment_metadata,
        created_at=assessment.created_at,
        updated_at=assessment.updated_at,
        explanation=exp_data,
        alerts_count=alerts_count,
        reviews_count=reviews_count
    )


@router.get("/{assessment_id}/explanation", response_model=ExplanationResponse)
def get_assessment_explanation(assessment_id: str, db: Session = Depends(get_db)):
    explanation = db.query(AssessmentExplanation).filter(
        AssessmentExplanation.assessment_id == assessment_id
    ).first()
    if not explanation:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"No explanation recorded for assessment '{assessment_id}'."
        )
    return ExplanationResponse.model_validate(explanation)
