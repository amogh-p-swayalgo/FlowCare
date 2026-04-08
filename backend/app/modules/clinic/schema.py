from pydantic import BaseModel
from typing import Optional
from datetime import datetime

# Clinic Signup
class ClinicResponse(BaseModel):
    id: str
    name: str
    address: Optional[str] = None
    phone: Optional[str] = None
    email: Optional[str] = None
    owner_name: Optional[str] = None
    reg_number: Optional[str] = None
    specialty: Optional[str] = None
    created_at: datetime

class ClinicSignupInput(BaseModel):
    phone: str
    clinic_name: str
    doctor_name: Optional[str] = "Doctor"
    password: str # Real-world auth requirement

class ClinicSignupOutput(BaseModel):
    clinic_id: str
    clinic_url: str

# Clinic Info (Professional details for dashboard and records)
class ClinicInfoResponse(BaseModel):
    name: str

    address: Optional[str] = None
    phone: Optional[str] = None
    email: Optional[str] = None
    owner_name: Optional[str] = None
    reg_number: Optional[str] = None
    specialty: Optional[str] = None

class ClinicUpdateInput(BaseModel):
    name: Optional[str] = None

    address: Optional[str] = None
    phone: Optional[str] = None
    email: Optional[str] = None
    owner_name: Optional[str] = None
    reg_number: Optional[str] = None
    specialty: Optional[str] = None


# Auth
class Token(BaseModel):
    access_token: str
    token_type: str
    clinic_id: str # Added for frontend redirection