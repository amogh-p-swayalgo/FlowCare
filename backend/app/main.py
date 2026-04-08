from fastapi import FastAPI, APIRouter
from fastapi.middleware.cors import CORSMiddleware
# Ensure all models are imported so they are registered for relationships
from app.modules.clinic.model import Clinic
from app.modules.users.model import User
from app.modules.queue.model import Queue
from app.modules.prescriptions.model import Prescription
from app.modules.clinic.router import router as clinic_router
from app.modules.queue.router import router as queue_router
from app.modules.prescriptions.router import router as prescriptions_router
from app.core.exceptions import setup_exception_handlers
from app.core.config import settings

app = FastAPI(title=settings.PROJECT_NAME)

app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.CORS_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

setup_exception_handlers(app)

api_router = APIRouter(prefix="/api/v1")
api_router.include_router(clinic_router)
api_router.include_router(queue_router)
api_router.include_router(prescriptions_router)

app.include_router(api_router)

@app.get("/")
def read_root():
    return {"message": "Welcome to FlowCare API"}
