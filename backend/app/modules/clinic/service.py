from sqlalchemy.orm import Session
from .model import Clinic
from .schema import ClinicCreate

class ClinicService:
    @staticmethod
    def create_clinic(db: Session, clinic_data: ClinicCreate) -> Clinic:
        new_clinic = Clinic(name=clinic_data.name, address=clinic_data.address)
        db.add(new_clinic)
        db.commit()
        db.refresh(new_clinic)
        return new_clinic