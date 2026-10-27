from datetime import datetime
from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.orm import Session
from sqlalchemy import desc
from app.db.session import get_db
from app.models.alert import Alert
from app.schemas.alert import AlertResponse, AlertUpdateStatus
from app.api.deps import get_current_user_optional
from app.services.audit_service import audit_service

router = APIRouter(prefix="/alerts", tags=["Alerts"])


@router.get("", response_model=List[AlertResponse])
def list_alerts(
    status: Optional[str] = Query(None),
    severity: Optional[str] = Query(None),
    module_id: Optional[str] = Query(None),
    skip: int = Query(0, ge=0),
    limit: int = Query(50, ge=1, le=200),
    db: Session = Depends(get_db)
):
    query = db.query(Alert)
    if status:
        query = query.filter(Alert.status == status)
    if severity:
        query = query.filter(Alert.severity == severity)
    if module_id:
        query = query.filter(Alert.module_id == module_id)

    alerts = query.order_by(desc(Alert.created_at)).offset(skip).limit(limit).all()
    return [AlertResponse.model_validate(a) for a in alerts]


@router.patch("/{alert_id}", response_model=AlertResponse)
def update_alert_status(
    alert_id: str,
    payload: AlertUpdateStatus,
    db: Session = Depends(get_db),
    current_user = Depends(get_current_user_optional)
):
    alert = db.query(Alert).filter(Alert.id == alert_id).first()
    if not alert:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Alert '{alert_id}' not found."
        )

    old_status = alert.status
    alert.status = payload.status
    user_name = current_user.full_name if current_user else "System Reviewer"

    if payload.status == "acknowledged":
        alert.acknowledged_at = datetime.utcnow()
    elif payload.status == "resolved":
        alert.resolved_at = datetime.utcnow()
        alert.resolved_by = user_name

    db.commit()
    db.refresh(alert)

    audit_service.log(
        db,
        action="ALERT_STATUS_UPDATED",
        resource_type="Alert",
        resource_id=alert.id,
        user_id=current_user.id if current_user else None,
        user_role=current_user.role if current_user else "anonymous",
        details={"old_status": old_status, "new_status": alert.status}
    )

    return AlertResponse.model_validate(alert)
