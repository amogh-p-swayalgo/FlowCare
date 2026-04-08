from fastapi import Request, status
from fastapi.responses import JSONResponse
from fastapi.exceptions import RequestValidationError
from app.utils.logger import logger

def setup_exception_handlers(app):
    @app.exception_handler(Exception)
    async def global_exception_handler(request: Request, exc: Exception):
        logger.error(f"Unhandled Exception: {exc}", exc_info=True)
        return JSONResponse(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            content={"detail": "Internal Server Error"},
        )

    @app.exception_handler(RequestValidationError)
    async def validation_exception_handler(request: Request, exc: RequestValidationError):
        logger.warning(f"Validation Error: {exc.errors()}")
        return JSONResponse(
            status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
            content={"detail": [{"msg": "Invalid input format", "type": "value_error"}]},
        )

    from sqlalchemy.exc import IntegrityError
    @app.exception_handler(IntegrityError)
    async def integrity_exception_handler(request: Request, exc: IntegrityError):
        logger.warning(f"Integrity Error: {exc}")
        message = "Already registered. This phone or clinic name is taken."
        if "users_phone_key" in str(exc):
            message = "This phone number is already registered."
        elif "clinics_pkey" in str(exc):
            message = "This clinic name is already taken."
            
        return JSONResponse(
            status_code=status.HTTP_400_BAD_REQUEST,
            content={"detail": message},
        )
