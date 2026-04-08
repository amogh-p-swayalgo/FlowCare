from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from app.core.database import get_db
from .schema import OTPRequest, OTPVerify, Token
from .service import UserService

router = APIRouter(prefix="/users", tags=["users"])

@router.post("/auth/request-otp", status_code=status.HTTP_200_OK)
def request_otp(data: OTPRequest):
    UserService.request_otp(data.phone_number)
    return {"message": "OTP sent successfully"}

@router.post("/auth/verify-otp", response_model=Token)
def verify_otp(data: OTPVerify, db: Session = Depends(get_db)):
    result = UserService.verify_otp(db, data)
    if not result:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid or expired OTP"
        )
    return result
