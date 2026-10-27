from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from sqlalchemy import func
from app.db.session import get_db
from app.models.assessment import Assessment
from app.models.alert import Alert
from app.models.review import FollowUpRecord
from app.models.module import ScreeningModule
from app.models.model_registry import ModelRegistryEntry
from app.schemas.stats import OverviewStats, StatusCount, RiskCount, ModuleCount

router = APIRouter(prefix="/stats", tags=["System Statistics"])


@router.get("/overview", response_model=OverviewStats)
def get_overview_statistics(db: Session = Depends(get_db)):
    total_assessments = db.query(Assessment).count()
    pending_review = db.query(Assessment).filter(Assessment.status == "pending_review").count()
    follow_ups_due = db.query(FollowUpRecord).filter(FollowUpRecord.status == "pending").count()
    active_alerts = db.query(Alert).filter(Alert.status == "active").count()
    critical_alerts = db.query(Alert).filter(Alert.status == "active", Alert.severity == "critical").count()

    # Status distribution
    status_rows = db.query(Assessment.status, func.count(Assessment.id)).group_by(Assessment.status).all()
    status_dist = [StatusCount(status=s, count=c) for s, c in status_rows]

    # Risk distribution
    risk_rows = db.query(Assessment.risk_level, func.count(Assessment.id)).group_by(Assessment.risk_level).all()
    risk_dist = [RiskCount(risk_level=r, count=c) for r, c in risk_rows]

    # Module distribution
    module_rows = db.query(Assessment.module_id, func.count(Assessment.id)).group_by(Assessment.module_id).all()
    modules_map = {m.id: m.name for m in db.query(ScreeningModule).all()}
    module_dist = [
        ModuleCount(
            module_id=m_id,
            name=modules_map.get(m_id, m_id.replace("_", " ").title()),
            count=c
        )
        for m_id, c in module_rows
    ]

    # Model metrics
    models_active = db.query(ModelRegistryEntry).filter(ModelRegistryEntry.status == "active").count()
    models_demo = db.query(ModelRegistryEntry).filter(
        (ModelRegistryEntry.status != "active") | (ModelRegistryEntry.validation_status != "clinical_validated")
    ).count()

    return OverviewStats(
        total_assessments=total_assessments,
        pending_review=pending_review,
        follow_ups_due=follow_ups_due,
        active_alerts=active_alerts,
        critical_alerts=critical_alerts,
        status_distribution=status_dist,
        risk_distribution=risk_dist,
        module_distribution=module_dist,
        models_active=models_active,
        models_experimental_or_demo=models_demo
    )
