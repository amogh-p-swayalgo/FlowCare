from pydantic import BaseModel, EmailStr
from typing import Optional
from .model import UserRole

class UserBase(BaseModel):
    phone_number: Optional[str] = None
    email: Optional[EmailStr] = None
    full_name: Optional[str] = None
    role: UserRole

class UserCreate(UserBase):
    pass

class UserResponse(UserBase):
    id: int

    class Config:
        from_attributes = True

class OTPRequest(BaseModel):
    phone_number: str

class OTPVerify(BaseModel):
    phone_number: str
    otp_code: str

class Token(BaseModel):
    access_token: str
    token_type: str
    user: UserResponse
