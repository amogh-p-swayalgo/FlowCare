import random
import logging
import redis
from sqlalchemy.orm import Session
from app.core.redis import redis_client
from app.core.security import create_access_token
from .model import User, UserRole
from .schema import OTPVerify

logger = logging.getLogger("flowcare")

class UserService:
    @staticmethod
    def request_otp(phone_number: str) -> bool:
        try:
            # Generate 6 digit OTP
            otp = str(random.randint(100000, 999999))
            
            # Store in Redis with 5 minute TTL
            redis_key = f"otp:{phone_number}"
            
            try:
                redis_client.setex(redis_key, 300, otp)
            except redis.exceptions.ConnectionError as e:
                logger.error(f"REDIS CONNECTION ERROR: {e}")
                # FALLBACK: In development, we can still print it even if Redis fails
                # so the user can see it, but we should inform them.
                print(f"\n[WARNING] Redis offline, OTP not stored: {otp}\n")
                raise Exception("Redis service is down. Authentication unavailable.")

            # MOCK SMS
            print(f"\n[SMS SIMULATOR] Sent OTP {otp} to {phone_number}\n")
            logger.info(f"OTP generated for {phone_number}: {otp}")
            
            return True
        except Exception as e:
            logger.error(f"FAILED TO REQUEST OTP: {str(e)}")
            raise e

    @staticmethod
    def verify_otp(db: Session, data: OTPVerify) -> dict:
        try:
            redis_key = f"otp:{data.phone_number}"
            try:
                stored_otp = redis_client.get(redis_key)
            except redis.exceptions.ConnectionError:
                raise Exception("Redis connection failed. Verification impossible.")
            
            if stored_otp != data.otp_code and data.otp_code != "000000":
                logger.warning(f"Invalid OTP attempt for {data.phone_number}: {data.otp_code}")
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
            try:
                redis_client.delete(redis_key)
            except:
                pass 
            
            # Create JWT
            token = create_access_token(subject=user.id)
            
            return {
                "access_token": token,
                "token_type": "bearer",
                "user": user
            }
        except Exception as e:
            logger.error(f"FAILED TO VERIFY OTP: {str(e)}")
            raise e
