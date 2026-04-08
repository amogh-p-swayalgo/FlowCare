from sqlalchemy.orm import Session
from sqlalchemy import func
from datetime import datetime
from .model import Queue, QueueStatus

class QueueService:
    @staticmethod
    def join_queue(db: Session, clinic_id: str, name: str, phone: str, age: int = None, gender: str = None) -> Queue:
        # Check if already in queue
        today = datetime.utcnow().date()
        existing = db.query(Queue).filter(
            Queue.clinic_id == clinic_id,
            Queue.phone == phone,
            Queue.status == QueueStatus.WAITING.value,
            func.date(Queue.joined_at) == today
        ).first()
        
        if existing:
            return existing

        # Get next token number
        last_entry = db.query(Queue).filter(
            Queue.clinic_id == clinic_id,
            func.date(Queue.joined_at) == today
        ).order_by(Queue.token_number.desc()).first()
        
        next_token = (last_entry.token_number + 1) if last_entry else 1
        
        new_entry = Queue(
            clinic_id=clinic_id,
            name=name,
            phone=phone,
            age=age,
            gender=gender,
            token_number=next_token
        )
        db.add(new_entry)
        db.commit()
        db.refresh(new_entry)
        return new_entry

    @staticmethod
    def is_new_patient(db: Session, clinic_id: str, phone: str) -> bool:
        from app.modules.prescriptions.model import Prescription
        if not phone: return True
        count = db.query(Prescription).filter(
            Prescription.clinic_id == clinic_id,
            Prescription.user_id == phone
        ).count()
        return count == 0

    @staticmethod
    def add_walkin(db: Session, clinic_id: str, name: str, phone: str, age: int = None, gender: str = None) -> Queue:
        return QueueService.join_queue(db, clinic_id, name, phone, age, gender)

    @staticmethod
    def get_user_status(db: Session, entry_id: int) -> dict:
        entry = db.query(Queue).filter(Queue.id == entry_id).first()
        if not entry:
            return None
        
        # Calculate position (how many waiting patients are before this one today)
        today = datetime.utcnow().date()
        people_in_front = db.query(Queue).filter(
            Queue.clinic_id == entry.clinic_id,
            Queue.status == QueueStatus.WAITING.value,
            Queue.token_number < entry.token_number,
            func.date(Queue.joined_at) == today
        ).count()

        return {
            "name": entry.name,
            "phone": entry.phone,
            "token_number": entry.token_number,
            "status": entry.status,
            "position": people_in_front + 1 if entry.status == QueueStatus.WAITING.value else 0,
            "clinic_id": entry.clinic_id
        }

    @staticmethod
    def get_clinic_waitlist(db: Session, clinic_id: str):
        today = datetime.utcnow().date()
        return db.query(Queue).filter(
            Queue.clinic_id == clinic_id,
            func.date(Queue.joined_at) == today,
            Queue.status == QueueStatus.WAITING.value
        ).order_by(Queue.token_number.asc()).all()

    @staticmethod
    def get_active_patient(db: Session, clinic_id: str) -> Queue:
        today = datetime.utcnow().date()
        return db.query(Queue).filter(
            Queue.clinic_id == clinic_id,
            Queue.status == QueueStatus.CALLED.value,
            func.date(Queue.joined_at) == today
        ).order_by(Queue.called_at.desc()).first()

    @staticmethod
    def call_next(db: Session, clinic_id: str) -> Queue:
        today = datetime.utcnow().date()
        
        # 1. Automatically mark any currently 'CALLED' patients as 'SKIPPED'
        # to clear the dashboard for the new patient.
        db.query(Queue).filter(
            Queue.clinic_id == clinic_id,
            Queue.status == QueueStatus.CALLED.value,
            func.date(Queue.joined_at) == today
        ).update({"status": QueueStatus.SKIPPED.value})
        
        # 2. Find the next 'WAITING' patient
        next_patient = db.query(Queue).filter(
            Queue.clinic_id == clinic_id,
            Queue.status == QueueStatus.WAITING.value,
            func.date(Queue.joined_at) == today
        ).order_by(Queue.token_number.asc()).first()
        
        if next_patient:
            next_patient.status = QueueStatus.CALLED.value
            next_patient.called_at = datetime.utcnow()
            db.commit()
            db.refresh(next_patient)
            return next_patient
        
        db.commit() # Commit the 'SKIPPED' updates even if no next patient
        return None

    @staticmethod
    def leave_queue(db: Session, entry_id: int):
        patient = db.query(Queue).filter(Queue.id == entry_id).first()
        if patient:
            patient.status = QueueStatus.SKIPPED.value
            db.commit()
        return patient

    @staticmethod
    def complete_patient(db: Session, entry_id: int):
        patient = db.query(Queue).filter(Queue.id == entry_id).first()
        if patient:
            patient.status = QueueStatus.COMPLETED.value
            db.commit()
        return patient

    @staticmethod
    def get_active_by_phone(db: Session, clinic_id: str, phone: str) -> Queue:
        today = datetime.utcnow().date()
        return db.query(Queue).filter(
            Queue.clinic_id == clinic_id,
            Queue.phone == phone,
            Queue.status.in_([QueueStatus.WAITING.value, QueueStatus.CALLED.value]),
            func.date(Queue.joined_at) == today
        ).order_by(Queue.joined_at.desc()).first()
