from pydantic import BaseModel
from typing import List, Optional
from datetime import datetime

class MedicineBase(BaseModel):
    name: str
    dosage: str
    duration: str

class MedicineSchema(MedicineBase):
    id: Optional[int] = None
    class Config:
        from_attributes = True

class PrescriptionCreate(BaseModel):
    clinic_id: str
    queue_entry_id: Optional[int] = None
    user_id: str
    patient_name: str
    patient_age: Optional[int] = None
    patient_gender: Optional[str] = None
    diagnosis: str
    medicines: List[MedicineBase]

class PrescriptionResponse(BaseModel):
    id: int
    clinic_id: str
    user_id: str
    patient_name: str
    patient_age: Optional[int] = None
    patient_gender: Optional[str] = None
    diagnosis: str
    
    # Snapshot Metadata
    doctor_name: Optional[str] = None
    doctor_specialty: Optional[str] = None
    doctor_reg_number: Optional[str] = None
    clinic_name: Optional[str] = None
    clinic_address: Optional[str] = None
    clinic_phone: Optional[str] = None
    
    medicines: List[MedicineSchema]
    created_at: datetime

    class Config:
        from_attributes = True

class PatientHistoryResponse(BaseModel):
    prescriptions: List[PrescriptionResponse]

class MedicineMasterResponse(BaseModel):
    id: int
    name: str
    default_dosage: Optional[str] = None
    default_duration: Optional[str] = None
    class Config:
        from_attributes = True

class TemplateResponse(BaseModel):
    id: int
    name: str
    diagnosis: str
    medicines_json: str
    class Config:
        from_attributes = True
