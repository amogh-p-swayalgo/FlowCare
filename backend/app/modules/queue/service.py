from typing import Optional
from sqlalchemy.orm import Session
from sqlalchemy import func
from datetime import datetime, date
from .model import Queue, QueueStatus

class QueueService:
    @staticmethod
    def join_queue(db: Session, user_id: int, clinic_id: int) -> Queue:
        # 1. Check if already in queue for this clinic today
        today = date.today()
        existing = db.query(Queue).filter(
            Queue.user_id == user_id,
            Queue.clinic_id == clinic_id,
            func.date(Queue.joined_at) == today,
            Queue.status == QueueStatus.WAITING
        ).first()
        
        if existing:
            return existing

        # 2. Get the last token number for today for this clinic
        last_token = db.query(func.max(Queue.token_number)).filter(
            Queue.clinic_id == clinic_id,
            func.date(Queue.joined_at) == today
        ).scalar() or 0
        
        new_token = last_token + 1

        # 3. Create new queue entry
        queue_item = Queue(
            user_id=user_id,
            clinic_id=clinic_id,
            token_number=new_token,
            status=QueueStatus.WAITING
        )
        
        db.add(queue_item)
        db.commit()
        db.refresh(queue_item)
        return queue_item

    @staticmethod
    def get_user_status(db: Session, user_id: int, clinic_id: int) -> dict:
        today = date.today()
        
        # Get user's current record
        my_record = db.query(Queue).filter(
            Queue.user_id == user_id,
            Queue.clinic_id == clinic_id,
            func.date(Queue.joined_at) == today
        ).order_by(Queue.joined_at.desc()).first()
        
        if not my_record:
            return None

        # Get current active token (the one being called now)
        current_active = db.query(func.max(Queue.token_number)).filter(
            Queue.clinic_id == clinic_id,
            func.date(Queue.joined_at) == today,
            Queue.status == QueueStatus.CALLED
        ).scalar() or 0

        # Calculate people in front
        # People waiting with a token number smaller than mine
        people_in_front = db.query(Queue).filter(
            Queue.clinic_id == clinic_id,
            func.date(Queue.joined_at) == today,
            Queue.status == QueueStatus.WAITING,
            Queue.token_number < my_record.token_number
        ).count()

    @staticmethod
    def get_clinic_queue(db: Session, clinic_id: int) -> list[Queue]:
        today = date.today()
        # Return all patients waiting or in-progress for today
        return db.query(Queue).filter(
            Queue.clinic_id == clinic_id,
            func.date(Queue.joined_at) == today
        ).order_by(Queue.token_number.asc()).all()

    @staticmethod
    def call_next_patient(db: Session, clinic_id: int) -> Optional[Queue]:
        today = date.today()
        
        # 1. Complete the current active patient
        current_active = db.query(Queue).filter(
            Queue.clinic_id == clinic_id,
            Queue.status == QueueStatus.CALLED,
            func.date(Queue.joined_at) == today
        ).first()
        
        if current_active:
            current_active.status = QueueStatus.COMPLETED
        
        # 2. Find the next one in line
        next_in_line = db.query(Queue).filter(
            Queue.clinic_id == clinic_id,
            Queue.status == QueueStatus.WAITING,
            func.date(Queue.joined_at) == today
        ).order_by(Queue.token_number.asc()).first()
        
        if next_in_line:
            next_in_line.status = QueueStatus.CALLED
            next_in_line.called_at = datetime.utcnow()
        
        db.commit()
        if next_in_line:
            db.refresh(next_in_line)
        return next_in_line
