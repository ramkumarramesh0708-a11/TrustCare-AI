from typing import List
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from app.db.session import get_db
from app.models.model_registry import ModelRegistryEntry
from app.schemas.model_registry import ModelRegistryResponse, ModelRegistryCreate
from app.api.deps import require_admin

router = APIRouter(prefix="/models", tags=["Model Registry"])


@router.get("", response_model=List[ModelRegistryResponse])
def list_registered_models(db: Session = Depends(get_db)):
    models = db.query(ModelRegistryEntry).all()
    return [ModelRegistryResponse.model_validate(m) for m in models]


@router.get("/{model_id}", response_model=ModelRegistryResponse)
def get_model_entry(model_id: str, db: Session = Depends(get_db)):
    model = db.query(ModelRegistryEntry).filter(
        (ModelRegistryEntry.id == model_id) | (ModelRegistryEntry.model_key == model_id)
    ).first()
    if not model:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Model registry entry '{model_id}' not found."
        )
    return ModelRegistryResponse.model_validate(model)


@router.post("", response_model=ModelRegistryResponse)
def register_model(
    payload: ModelRegistryCreate,
    db: Session = Depends(get_db),
    current_user = Depends(require_admin)
):
    existing = db.query(ModelRegistryEntry).filter(ModelRegistryEntry.model_key == payload.model_key).first()
    if existing:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Model with key '{payload.model_key}' is already registered."
        )

    entry = ModelRegistryEntry(
        model_key=payload.model_key,
        name=payload.name,
        domain=payload.domain,
        version=payload.version,
        status=payload.status,
        validation_status=payload.validation_status,
        intended_use=payload.intended_use,
        limitations=payload.limitations,
        metrics=payload.metrics
    )
    db.add(entry)
    db.commit()
    db.refresh(entry)
    return ModelRegistryResponse.model_validate(entry)
