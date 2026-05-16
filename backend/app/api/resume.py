from fastapi import APIRouter, Depends, HTTPException, UploadFile, File, Form
from app.services.resume_service import resume_service
from app.api.dependencies import get_current_active_user
from app.models.user import User

router = APIRouter()

@router.post("/parse")
async def parse_resume(
    file: UploadFile = File(...),
    current_user: User = Depends(get_current_active_user)
):
    """Upload and parse a base resume PDF."""
    if not file.filename.endswith('.pdf'):
        raise HTTPException(status_code=400, detail="Only PDF files are supported.")
    
    content = await file.read()
    try:
        text = resume_service.extract_text_from_pdf(content)
        # In a real app, we would store this text/embedding in the database here
        return {"filename": file.filename, "extracted_text_preview": text[:500] + "..."}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/tailor")
async def tailor_resume(
    base_resume_text: str = Form(...),
    job_description: str = Form(...),
    current_user: User = Depends(get_current_active_user)
):
    """Tailor a resume to a job description."""
    try:
        tailored_data = resume_service.tailor_resume(base_resume_text, job_description)
        return tailored_data
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
