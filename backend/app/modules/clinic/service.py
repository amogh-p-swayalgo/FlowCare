from sqlalchemy.orm import Session
from .model import Clinic
from ..users.model import User, UserRole
from app.core.security import get_password_hash
import re

class ClinicService:
    @staticmethod
    def signup_clinic(db: Session, data) -> Clinic:
        # Generate slug from clinic name
        slug = re.sub(r'[^a-zA-Z0-9]', '-', data.clinic_name.lower())
        
        # Check for slug collision
        existing = db.query(Clinic).filter(Clinic.id == slug).first()
        if existing:
            import random
            slug = f"{slug}-{random.randint(100, 999)}"

        # 1. Create Clinic
        new_clinic = Clinic(id=slug, name=data.clinic_name)
        db.add(new_clinic)
        db.flush() # Get ID for transaction

        # 2. Create Doctor User
        doctor = User(
            clinic_id=new_clinic.id,
            name=data.doctor_name,
            phone=data.phone,
            hashed_password=get_password_hash(data.password),
            role=UserRole.DOCTOR
        )
        db.add(doctor)
        db.commit()
        db.refresh(new_clinic)
        
        return new_clinic

    @staticmethod
    def get_clinic_by_id(db: Session, clinic_id: str) -> Clinic:
        return db.query(Clinic).filter(Clinic.id == clinic_id).first()

    @staticmethod
    def update_clinic(db: Session, clinic_id: str, data) -> Clinic:
        clinic = db.query(Clinic).filter(Clinic.id == clinic_id).first()
        if clinic:
            if hasattr(data, 'name') and data.name: clinic.name = data.name

            if hasattr(data, 'address'): clinic.address = data.address
            if hasattr(data, 'phone'): clinic.phone = data.phone
            if hasattr(data, 'email'): clinic.email = data.email
            if hasattr(data, 'owner_name'): clinic.owner_name = data.owner_name
            if hasattr(data, 'reg_number'): clinic.reg_number = data.reg_number
            if hasattr(data, 'specialty'): clinic.specialty = data.specialty
            
            db.commit()
            db.refresh(clinic)
        return clinic