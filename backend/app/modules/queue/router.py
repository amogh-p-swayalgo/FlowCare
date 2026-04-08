from fastapi import APIRouter, Depends, HTTPException, status
from typing import Optional
from sqlalchemy.orm import Session
from app.core.database import get_db
from .schema import QueueJoinRequest, QueueResponse, QueueStatusResponse
from .service import QueueService

# In a real app, we'd have a get_current_user dependency here
# For the simplified demo, we will pass user_id as a query param or placeholder
router = APIRouter(prefix="/queue", tags=["queue"])

@router.post("/join", response_model=QueueResponse)
def join_queue(data: QueueJoinRequest, user_id: int, db: Session = Depends(get_db)):
    return QueueService.join_queue(db, user_id, data.clinic_id)

@router.get("/{clinic_id}/status", response_model=QueueStatusResponse)
def get_queue_status(clinic_id: int, user_id: int, db: Session = Depends(get_db)):
    result = QueueService.get_user_status(db, user_id, clinic_id)
    if not result:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Queue record not found"
        )
    return result

@router.get("/{clinic_id}/list", response_model=list[QueueResponse])
def list_queue(clinic_id: int, db: Session = Depends(get_db)):
    return QueueService.get_clinic_queue(db, clinic_id)

@router.post("/{clinic_id}/next", response_model=Optional[QueueResponse])
def call_next(clinic_id: int, db: Session = Depends(get_db)):
    return QueueService.call_next_patient(db, clinic_id)
