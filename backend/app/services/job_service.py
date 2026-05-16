from sqlalchemy.orm import Session
from app.models.job import Job, JobApplication
from app.schemas.job import JobCreate, JobApplicationCreate, JobApplicationUpdate
from typing import List

def get_jobs(db: Session, skip: int = 0, limit: int = 100) -> List[Job]:
    return db.query(Job).order_by(Job.created_at.desc()).offset(skip).limit(limit).all()

def create_job(db: Session, job: JobCreate) -> Job:
    db_job = Job(**job.model_dump())
    db.add(db_job)
    db.commit()
    db.refresh(db_job)
    return db_job

def get_user_applications(db: Session, user_id: int, skip: int = 0, limit: int = 100) -> List[JobApplication]:
    return db.query(JobApplication).filter(JobApplication.user_id == user_id).order_by(JobApplication.created_at.desc()).offset(skip).limit(limit).all()

def create_job_application(db: Session, application: JobApplicationCreate, user_id: int) -> JobApplication:
    db_app = JobApplication(**application.model_dump(), user_id=user_id)
    db.add(db_app)
    db.commit()
    db.refresh(db_app)
    return db_app

def update_job_application(db: Session, application_id: int, user_id: int, application_update: JobApplicationUpdate) -> JobApplication:
    db_app = db.query(JobApplication).filter(JobApplication.id == application_id, JobApplication.user_id == user_id).first()
    if not db_app:
        return None
    
    update_data = application_update.model_dump(exclude_unset=True)
    for key, value in update_data.items():
        setattr(db_app, key, value)
        
    db.commit()
    db.refresh(db_app)
    return db_app
