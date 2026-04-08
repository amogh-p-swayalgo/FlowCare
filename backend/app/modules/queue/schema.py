from pydantic import BaseModel
from datetime import datetime
from typing import Optional
from .model import QueueStatus

class QueueBase(BaseModel):
    clinic_id: int

class QueueJoinRequest(QueueBase):
    pass

class QueueResponse(QueueBase):
    id: int
    user_id: int
    token_number: int
    status: QueueStatus
    joined_at: datetime
    
    class Config:
        from_attributes = True

class QueueStatusResponse(BaseModel):
    my_token: int
    current_active_token: int
    people_in_front: int
    status: QueueStatus
