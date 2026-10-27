from datetime import datetime
from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.orm import Session
from sqlalchemy import desc
from app.db.session import get_db
from app.models.review import FollowUpRecord
from app.schemas.review import FollowUpResponse, FollowUpCreate, FollowUpUpdate
from app.api.deps import require_reviewer
from app.services.audit_service import audit_service

router = APIRouter(prefix="/follow-ups", tags=["Follow-Ups"])


@router.get("", response_model=List[FollowUpResponse])
def list_follow_ups(
    status: Optional[str] = Query(None),
    skip: int = Query(0, ge=0),
    limit: int = Query(50, ge=1, le=200),
    db: Session = Depends(get_db)
):
    query = db.query(FollowUpRecord)
    if status:
        query = query.filter(FollowUpRecord.status == status)

    records = query.order_by(FollowUpRecord.due_date.asc()).offset(skip).limit(limit).all()
    return [FollowUpResponse.model_validate(r) for r in records]


@router.post("", response_model=FollowUpResponse)
def create_follow_up(
    payload: FollowUpCreate,
    db: Session = Depends(get_db),
    current_user = Depends(require_reviewer)
):
    record = FollowUpRecord(
        assessment_id=payload.assessment_id,
        due_date=payload.due_date,
        status="pending",
        note=payload.note,
        contact_channel=payload.contact_channel
    )
    db.add(record)
    db.commit()
    db.refresh(record)

    audit_service.log(
        db,
        action="FOLLOW_UP_SCHEDULED",
        resource_type="FollowUpRecord",
        resource_id=record.id,
        user_id=current_user.id,
        user_role=current_user.role,
        details={"assessment_id": payload.assessment_id, "due_date": str(payload.due_date)}
    )

    return FollowUpResponse.model_validate(record)


@router.patch("/{follow_up_id}", response_model=FollowUpResponse)
def update_follow_up(
    follow_up_id: str,
    payload: FollowUpUpdate,
    db: Session = Depends(get_db),
    current_user = Depends(require_reviewer)
):
    record = db.query(FollowUpRecord).filter(FollowUpRecord.id == follow_up_id).first()
    if not record:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Follow-up record '{follow_up_id}' not found."
        )

    record.status = payload.status
    if payload.note:
        record.note = f"{record.note} | Update: {payload.note}"
    if payload.status == "completed":
        record.completed_at = datetime.utcnow()

    db.commit()
    db.refresh(record)

    audit_service.log(
        db,
        action="FOLLOW_UP_UPDATED",
        resource_type="FollowUpRecord",
        resource_id=record.id,
        user_id=current_user.id,
        user_role=current_user.role,
        details={"status": record.status}
    )

    return FollowUpResponse.model_validate(record)
