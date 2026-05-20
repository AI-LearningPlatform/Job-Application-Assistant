from fastapi import APIRouter, Depends, HTTPException, UploadFile, File, Form, Response
from app.services.resume_service import resume_service
from app.api.dependencies import get_current_active_user
from app.models.user import User

router = APIRouter()


@router.post("/tailor-preview")
async def tailor_resume_preview(
    file: UploadFile = File(...),
    job_description: str = Form(...),
):
    """Parse a resume PDF and return editable tailored resume content."""
    if not file.filename.endswith('.pdf'):
        raise HTTPException(status_code=400, detail="Only PDF files are supported.")

    content = await file.read()
    try:
        return resume_service.build_tailored_resume_preview(content, job_description)
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.post("/download-pdf")
async def download_tailored_pdf(
    tailored_summary: str = Form(...),
    skills: str = Form(...),
    bullet_points: str = Form(...),
    job_description: str = Form(...),
):
    """Generate a downloadable PDF from edited tailored resume content."""
    try:
        pdf = resume_service.generate_tailored_pdf(tailored_summary, skills, bullet_points, job_description)
        return Response(
            content=pdf,
            media_type="application/pdf",
            headers={"Content-Disposition": 'attachment; filename="tailored-resume.pdf"'},
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

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
