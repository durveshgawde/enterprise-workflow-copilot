from fastapi import APIRouter, Depends
from app.schemas.ai import SOPRequest, SOPResponse, RewriteRequest, RewriteResponse
from app.services.ai import generate_sop, rewrite_step, save_workflow_to_db
from app.utils.jwt import get_current_user

router = APIRouter()

@router.post("/convert")
async def convert_text_to_sop(
    payload: SOPRequest,
    current_user = Depends(get_current_user)
):
    """Convert raw text to structured SOP using Gemini"""
    try:
        result = generate_sop(payload.raw_text)
        
        if result.get("success"):
            return {
                "success": True,
                "workflow": result["workflow"]
            }
        else:
            return {
                "success": False,
                "error": result.get("error", "AI generation failed")
            }
    except Exception as e:
        return {
            "success": False,
            "error": f"AI service error: {str(e)}"
        }

@router.post("/convert-and-save")
async def convert_and_save(
    payload: dict,
    current_user = Depends(get_current_user)
):
    """Convert text and save to database"""
    result = generate_sop(payload.get("raw_text"))
    
    if not result.get("success"):
        return {
            "success": False,
            "error": result.get("error")
        }
    
    workflow = result["workflow"]
    
    if payload.get("title"):
        workflow["title"] = payload["title"]
    
    save_result = save_workflow_to_db(
        workflow,
        payload.get("organization_id"),
        current_user["user_id"]
    )
    
    return {
        "success": save_result.get("success"),
        "workflow_id": save_result.get("workflow_id"),
        "steps_created": save_result.get("steps_created")
    }

@router.post("/rewrite")
async def rewrite(
    payload: RewriteRequest,
    current_user = Depends(get_current_user)
):
    """Rewrite step using Gemini"""
    result = rewrite_step(payload.step_text, payload.tone)
    return result
