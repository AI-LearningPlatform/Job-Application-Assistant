from fastapi import APIRouter, Depends, HTTPException, BackgroundTasks
from pydantic import BaseModel
from app.services.browser_agent import browser_agent
from app.api.dependencies import get_current_active_user
from app.models.user import User

router = APIRouter()

class AutoApplyRequest(BaseModel):
    job_id: int
    job_url: str

@router.post("/apply")
async def trigger_auto_apply(
    request: AutoApplyRequest,
    current_user: User = Depends(get_current_active_user)
):
    """Trigger the automated job application process for a specific job."""
    if browser_agent.is_running:
        return {"status": "busy", "message": "An agent is already running an application. Please wait."}
    
    # In a real app, you'd fetch the user's profile and resume from DB
    user_profile = {
        "firstName": current_user.full_name.split()[0] if current_user.full_name else "Test",
        "lastName": current_user.full_name.split()[-1] if current_user.full_name else "User",
        "email": current_user.email
    }
    
    # Run the playwright script asynchronously 
    # (In a production system, this should be sent to Celery/Redis instead of running in the request thread directly,
    # but for this MVP, we await it directly or use BackgroundTasks)
    
    try:
        result = await browser_agent.auto_apply(request.job_url, user_profile)
        return result
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Automation error: {str(e)}")
