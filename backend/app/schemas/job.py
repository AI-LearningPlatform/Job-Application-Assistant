from typing import Optional, List
from pydantic import BaseModel
from datetime import datetime
from app.models.job import ApplicationStatus

# Job Schemas
class JobBase(BaseModel):
    title: str
    company: str
    description: Optional[str] = None
    url: str
    source: Optional[str] = None
    location: Optional[str] = None

class JobCreate(JobBase):
    pass

class JobInDB(JobBase):
    id: int
    created_at: datetime

    class Config:
        from_attributes = True

class Job(JobInDB):
    pass

# Job Application Schemas
class JobApplicationBase(BaseModel):
    job_id: int
    status: Optional[ApplicationStatus] = ApplicationStatus.SAVED
    notes: Optional[str] = None

class JobApplicationCreate(JobApplicationBase):
    pass

class JobApplicationUpdate(BaseModel):
    status: Optional[ApplicationStatus] = None
    notes: Optional[str] = None
    applied_at: Optional[datetime] = None

class JobApplicationInDB(JobApplicationBase):
    id: int
    user_id: int
    applied_at: Optional[datetime]
    created_at: datetime

    class Config:
        from_attributes = True

class JobApplication(JobApplicationInDB):
    job: Job
