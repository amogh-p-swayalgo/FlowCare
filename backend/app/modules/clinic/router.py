from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from app.core.database import get_db
from .schema import ClinicCreate, ClinicResponse
from .service import ClinicService

router = APIRouter(prefix='/clinic', tags=['clinic'])

@router.post("/", response_model=ClinicResponse)
def create_new_clinic(clinic: ClinicCreate, db: Session = Depends(get_db)):
    return ClinicService.create_clinic(db, clinic)