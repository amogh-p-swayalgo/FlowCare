from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from app.core.database import get_db
from .model import Prescription, Medicine, MedicineMaster, PrescriptionTemplate
from .schema import (
    PrescriptionCreate, PrescriptionResponse, PatientHistoryResponse,
    MedicineMasterResponse, TemplateResponse
)
from app.core.deps import get_clinic_doctor
from app.modules.queue.service import QueueService
from app.modules.users.model import User

router = APIRouter(prefix="/prescriptions", tags=["prescriptions"])

@router.get("/search/medicines", response_model=list[MedicineMasterResponse])
def search_medicines(
    q: str = Query("", min_length=1),
    db: Session = Depends(get_db),
    doctor: User = Depends(get_clinic_doctor)
):
    return db.query(MedicineMaster).filter(
        MedicineMaster.name.ilike(f"%{q}%")
    ).limit(10).all()

@router.get("/templates", response_model=list[TemplateResponse])
def get_templates(
    clinic_id: str,
    db: Session = Depends(get_db),
    doctor: User = Depends(get_clinic_doctor)
):
    # Get templates for this clinic + global templates (clinic_id is null)
    return db.query(PrescriptionTemplate).filter(
        (PrescriptionTemplate.clinic_id == clinic_id) | 
        (PrescriptionTemplate.clinic_id == None)
    ).all()

@router.post("/{clinic_id}/create", response_model=PrescriptionResponse)
def create_prescription(
    clinic_id: str,
    data: PrescriptionCreate, 
    db: Session = Depends(get_db),
    doctor: User = Depends(get_clinic_doctor)
):
    from app.modules.clinic.model import Clinic
    # Fetch clinic for snapshot
    clinic = db.query(Clinic).filter(Clinic.id == clinic_id).first()
    
    # 1. Create Prescription Header with Snapshots
    new_presc = Prescription(
        clinic_id=clinic_id,
        queue_entry_id=data.queue_entry_id,
        user_id=data.user_id,
        patient_name=data.patient_name,
        patient_age=data.patient_age,
        patient_gender=data.patient_gender,
        diagnosis=data.diagnosis,
        
        # Snapshots
        doctor_name=doctor.name,
        doctor_specialty=doctor.specialty, # Assuming specialty is on User model or we set it later
        doctor_reg_number=doctor.reg_number,
        
        clinic_name=clinic.name if clinic else clinic_id,
        clinic_address=clinic.address if clinic else None,
        clinic_phone=clinic.phone if clinic else None
    )
    db.add(new_presc)
    db.flush() # Get ID for medicines
    
    # 2. Add Medicines
    for med in data.medicines:
        db.add(Medicine(
            prescription_id=new_presc.id,
            name=med.name,
            dosage=med.dosage,
            duration=med.duration
        ))
    
    # 3. Mark queue entry as COMPLETED if exists
    if data.queue_entry_id:
        QueueService.complete_patient(db, data.queue_entry_id)
    
    db.commit()
    db.refresh(new_presc)
    return new_presc

@router.get("/{user_id}/history", response_model=PatientHistoryResponse)
def get_patient_history(
    user_id: str, 
    clinic_id: str = Query(...),
    db: Session = Depends(get_db)
):
    # Publicly accessible list of past visits for a specific user at a clinic
    history = db.query(Prescription).filter(
        Prescription.user_id == user_id,
        Prescription.clinic_id == clinic_id
    ).order_by(Prescription.created_at.desc()).all()
    
    return {"prescriptions": history}

@router.get("/by-entry/{entry_id}", response_model=PatientHistoryResponse)
def get_history_by_entry(entry_id: int, db: Session = Depends(get_db)):
    from app.modules.queue.model import Queue
    # 1. Find the entry to get the phone number (user_id)
    entry = db.query(Queue).filter(Queue.id == entry_id).first()
    if not entry:
        raise HTTPException(status_code=404, detail="Queue entry not found")
    
    # 2. Get all history for this phone at this clinic
    history = db.query(Prescription).filter(
        Prescription.user_id == entry.phone,
        Prescription.clinic_id == entry.clinic_id
    ).order_by(Prescription.created_at.desc()).all()
    
    return {"prescriptions": history}
@router.get("/patient-profile/{phone}")
def get_patient_profile(phone: str, clinic_id: str = Query(...), db: Session = Depends(get_db)):
    # Find the most recent prescription to get the latest demographics
    latest = db.query(Prescription).filter(
        Prescription.user_id == phone,
        Prescription.clinic_id == clinic_id
    ).order_by(Prescription.created_at.desc()).first()
    
    if not latest:
        raise HTTPException(status_code=404, detail="Patient profile not found at this clinic")
    
    return {
        "name": latest.patient_name,
        "age": latest.patient_age,
        "gender": latest.patient_gender
    }


@router.get("/single/{id}", response_model=PrescriptionResponse)
def get_single_prescription(id: int, db: Session = Depends(get_db)):
    presc = db.query(Prescription).filter(Prescription.id == id).first()
    if not presc:
        raise HTTPException(status_code=404, detail="Prescription not found")
    return presc
