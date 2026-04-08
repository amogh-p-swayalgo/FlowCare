from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from fastapi.security import OAuth2PasswordRequestForm
from app.core.database import get_db
from app.core import security
from .schema import ClinicSignupInput, ClinicSignupOutput, ClinicInfoResponse, ClinicUpdateInput, Token

from .service import ClinicService
from app.modules.users.model import User, UserRole
from app.core.deps import get_clinic_doctor # Correct import

router = APIRouter(prefix="/clinic", tags=["clinic"])

@router.post("/signup", response_model=ClinicSignupOutput)
def signup(data: ClinicSignupInput, db: Session = Depends(get_db)):
    clinic = ClinicService.signup_clinic(db, data)
    return {
        "clinic_id": clinic.id,
        "clinic_url": f"/clinic/{clinic.id}"
    }

@router.get("/{clinic_id}", response_model=ClinicInfoResponse)
def get_info(clinic_id: str, db: Session = Depends(get_db)):
    clinic = ClinicService.get_clinic_by_id(db, clinic_id)
    if not clinic:
        raise HTTPException(status_code=404, detail="Clinic not found")
    return clinic


@router.get("/{clinic_id}/admin", response_model=ClinicInfoResponse)
def get_admin_info(
    clinic_id: str, 
    db: Session = Depends(get_db),
    doctor: User = Depends(get_clinic_doctor)
):
    clinic = ClinicService.get_clinic_by_id(db, clinic_id)
    if not clinic:
        raise HTTPException(status_code=404, detail="Clinic not found")
    return clinic


@router.patch("/{clinic_id}", response_model=ClinicInfoResponse)
def update_clinic(
    clinic_id: str,
    data: ClinicUpdateInput,
    db: Session = Depends(get_db),
    doctor: User = Depends(get_clinic_doctor)
):
    clinic = ClinicService.update_clinic(db, clinic_id, data)
    if not clinic:
        raise HTTPException(status_code=404, detail="Clinic not found")
    return clinic


@router.post("/login", response_model=Token)
def login(form_data: OAuth2PasswordRequestForm = Depends(), db: Session = Depends(get_db)):
    user = db.query(User).filter(User.phone == form_data.username).first()
    if not user or not security.verify_password(form_data.password, user.hashed_password):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect phone or password",
            headers={"WWW-Authenticate": "Bearer"},
        )
    
    access_token = security.create_access_token(subject=user.id)
    return {
        "access_token": access_token, 
        "token_type": "bearer",
        "clinic_id": user.clinic_id
    }