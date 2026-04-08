from fastapi import APIRouter, Depends, HTTPException
from typing import Optional
from sqlalchemy.orm import Session
from app.core.database import get_db
from .service import QueueService
from .schema import QueueJoinInput, QueueResponse, QueueStatusResponse

from app.core.deps import get_clinic_doctor
from app.modules.users.model import User

router = APIRouter(prefix="/queue", tags=["queue"])

@router.post("/join", response_model=QueueResponse)
def join_queue(data: QueueJoinInput, db: Session = Depends(get_db)):
    entry = QueueService.join_queue(db, data.clinic_id, data.name, data.phone, data.age, data.gender)
    return entry

@router.post("/walkin/{clinic_id}", response_model=QueueResponse)
def add_walkin(
    clinic_id: str,
    data: QueueJoinInput,
    db: Session = Depends(get_db),
    doctor: User = Depends(get_clinic_doctor)
):
    return QueueService.add_walkin(db, clinic_id, data.name, data.phone, data.age, data.gender)

@router.get("/status/{entry_id}", response_model=QueueStatusResponse)
def get_status(entry_id: int, db: Session = Depends(get_db)):
    status = QueueService.get_user_status(db, entry_id)
    if not status:
        raise HTTPException(status_code=404, detail="Queue entry not found")
    return status

@router.get("/list/{clinic_id}", response_model=list[QueueResponse])
def list_queue(
    clinic_id: str, 
    db: Session = Depends(get_db),
    doctor: User = Depends(get_clinic_doctor)
):
    patients = QueueService.get_clinic_waitlist(db, clinic_id)
    # Augment with 'is_new_patient'
    for p in patients:
        p.is_new_patient = QueueService.is_new_patient(db, clinic_id, p.phone)
    return patients

@router.get("/active/{clinic_id}", response_model=Optional[QueueResponse])
def get_active(
    clinic_id: str, 
    db: Session = Depends(get_db),
    doctor: User = Depends(get_clinic_doctor)
):
    patient = QueueService.get_active_patient(db, clinic_id)
    if patient:
        patient.is_new_patient = QueueService.is_new_patient(db, clinic_id, patient.phone)
    return patient

@router.post("/next/{clinic_id}", response_model=Optional[QueueResponse])
def call_next(
    clinic_id: str, 
    db: Session = Depends(get_db),
    doctor: User = Depends(get_clinic_doctor)
):
    patient = QueueService.call_next(db, clinic_id)
    if patient:
        patient.is_new_patient = QueueService.is_new_patient(db, clinic_id, patient.phone)
    return patient

@router.get("/active-by-phone/{clinic_id}/{phone}", response_model=Optional[QueueResponse])
def get_active_by_phone(clinic_id: str, phone: str, db: Session = Depends(get_db)):
    return QueueService.get_active_by_phone(db, clinic_id, phone)

@router.post("/leave/{entry_id}")
def leave_queue(entry_id: int, db: Session = Depends(get_db)):
    return QueueService.leave_queue(db, entry_id)
