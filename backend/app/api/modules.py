from typing import List
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from app.db.session import get_db
from app.models.module import ScreeningModule
from app.schemas.module import ModuleResponse

router = APIRouter(prefix="/modules", tags=["Screening Modules"])


@router.get("", response_model=List[ModuleResponse])
def get_all_modules(db: Session = Depends(get_db)):
    modules = db.query(ScreeningModule).filter(ScreeningModule.is_active == True).all()
    return [ModuleResponse.model_validate(m) for m in modules]


@router.get("/{module_id}", response_model=ModuleResponse)
def get_module_by_id(module_id: str, db: Session = Depends(get_db)):
    module = db.query(ScreeningModule).filter(ScreeningModule.id == module_id).first()
    if not module:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Screening module '{module_id}' not found.",
        )
    return ModuleResponse.model_validate(module)
