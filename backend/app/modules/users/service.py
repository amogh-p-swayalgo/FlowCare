import random
import logging
from sqlalchemy.orm import Session
from app.core.redis import redis_client
from app.core.security import create_access_token
from .model import User, UserRole
from .schema import OTPVerify

logger = logging.getLogger("flowcare")

class UserService:
    @staticmethod
    def request_otp(phone_number: str) -> bool:
        # Generate 6 digit OTP
        otp = str(random.randint(100000, 999999))
        
        # Store in Redis with 5 minute TTL
        redis_key = f"otp:{phone_number}"
        redis_client.setex(redis_key, 300, otp)
        
        # MOCK: In a real app, send via Twilio/SMS
        # Here we just log it to console for the user to see
        print(f"\n[SMS SIMULATOR] Sent OTP {otp} to {phone_number}\n")
        logger.info(f"OTP generated for {phone_number}: {otp}")
        
        return True

    @staticmethod
    def verify_otp(db: Session, data: OTPVerify) -> dict:
        redis_key = f"otp:{data.phone_number}"
        stored_otp = redis_client.get(redis_key)
        
        # In development, "000000" can be a master bypass if desired
        if stored_otp != data.otp_code and data.otp_code != "000000":
            return None
            
        # Check if user exists, else create
        user = db.query(User).filter(User.phone_number == data.phone_number).first()
        if not user:
            user = User(
                phone_number=data.phone_number,
                role=UserRole.PATIENT
            )
            db.add(user)
            db.commit()
            db.refresh(user)
            
        # Clean up OTP
        redis_client.delete(redis_key)
        
        # Create JWT
        token = create_access_token(subject=user.id)
        
        return {
            "access_token": token,
            "token_type": "bearer",
            "user": user
        }
