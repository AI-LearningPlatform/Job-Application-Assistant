from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from typing import List, Optional
import requests
from app.core.database import get_db
from app.models.user import User
from app.schemas.job import Job, JobCreate, JobApplication, JobApplicationCreate, JobApplicationUpdate
from app.api.dependencies import get_current_active_user
from app.services import job_service

router = APIRouter()

@router.get("/market")
def get_real_market_jobs(
    role: Optional[str] = Query("Data Analyst", description="Role to search for"),
    limit: int = Query(15, le=50)
):
    """Fetch real jobs from the public Remotive API without an API key."""
    try:
        url = f"https://remotive.com/api/remote-jobs?search={role}&limit={limit}"
        response = requests.get(url, timeout=10)
        response.raise_for_status()
        
        data = response.json()
        jobs_data = data.get("jobs", [])
        
        formatted_jobs = []
        for index, j in enumerate(jobs_data):
            formatted_jobs.append({
                "id": f"remotive_{j.get('id', index)}",
                "title": j.get("title", ""),
                "company": j.get("company_name", ""),
                "location": j.get("candidate_required_location", "Remote"),
                "salary": j.get("salary") or "Competitive",
                "match_score": max(50, 95 - (index * 2)), # Mock score
                "url": j.get("url", ""),
                "source": "Remotive API",
                "category": j.get("category", "")
            })
            
        return formatted_jobs
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to fetch market jobs: {str(e)}")

@router.get("/", response_model=List[Job])
def read_jobs(skip: int = 0, limit: int = 100, db: Session = Depends(get_db)):
    """Retrieve available jobs (Mocking external fetching for now)"""
    jobs = job_service.get_jobs(db, skip=skip, limit=limit)
    return jobs

@router.post("/", response_model=Job)
def create_job(job_in: JobCreate, db: Session = Depends(get_db)):
    """Create a new job listing (Internal endpoint for scraper bots)"""
    return job_service.create_job(db, job=job_in)

@router.get("/applications", response_model=List[JobApplication])
def read_user_applications(
    skip: int = 0, 
    limit: int = 100, 
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    """Retrieve applications for the current user"""
    return job_service.get_user_applications(db, user_id=current_user.id, skip=skip, limit=limit)

@router.post("/applications", response_model=JobApplication)
def create_application(
    app_in: JobApplicationCreate, 
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    """Save a job or apply for a job"""
    return job_service.create_job_application(db, application=app_in, user_id=current_user.id)

@router.put("/applications/{application_id}", response_model=JobApplication)
def update_application(
    application_id: int,
    app_update: JobApplicationUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    """Update job application status or notes"""
    app = job_service.update_job_application(db, application_id=application_id, user_id=current_user.id, application_update=app_update)
    if not app:
        raise HTTPException(status_code=404, detail="Application not found")
    return app
