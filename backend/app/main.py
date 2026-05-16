from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.core.database import engine, Base
from app.models import user, job

# Create tables (For dev purposes, otherwise use Alembic)
Base.metadata.create_all(bind=engine)

app = FastAPI(
    title="AI Job Application Assistant API",
    description="Backend API for Job Portfolio and Automation Platform",
    version="1.0.0"
)

# Configure CORS
origins = [
    "http://localhost",
    "http://localhost:5173", # Default Vite port
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

from app.api.auth import router as auth_router
from app.api.jobs import router as jobs_router
from app.api.resume import router as resume_router
from app.api.automate import router as automate_router
from app.core.config import settings

app.include_router(auth_router, prefix=f"{settings.API_V1_STR}/auth", tags=["auth"])
app.include_router(jobs_router, prefix=f"{settings.API_V1_STR}/jobs", tags=["jobs"])
app.include_router(resume_router, prefix=f"{settings.API_V1_STR}/resume", tags=["resume"])
app.include_router(automate_router, prefix=f"{settings.API_V1_STR}/automate", tags=["automate"])

@app.get("/")
def read_root():
    return {"message": "Welcome to AI Job Application Assistant API"}

@app.get("/health")
def health_check():
    return {"status": "healthy"}
