from pydantic import BaseModel
from typing import Optional
from datetime import datetime

class QueueJoinInput(BaseModel):
    clinic_id: str
    name: str
    phone: Optional[str] = None
    age: Optional[int] = None
    gender: Optional[str] = None # M, F, O

class QueueResponse(BaseModel):
    id: int
    name: str
    phone: Optional[str] = None
    token_number: int
    status: str
    age: Optional[int] = None
    gender: Optional[str] = None
    is_new_patient: bool = False
    joined_at: datetime

    class Config:
        from_attributes = True

class QueueStatusResponse(BaseModel):
    name: str
    phone: Optional[str] = None
    token_number: int
    status: str
    position: int
    clinic_id: str
