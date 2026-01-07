from google import genai
from google.genai import types
import json
from app.config import settings
from app.utils.supabase import sb_insert


# Initialize Gemini client
def get_gemini_client():
    """Get configured Gemini client"""
    return genai.Client(api_key=settings.GEMINI_API_KEY)

SYSTEM_PROMPT = """
You are an enterprise workflow and SOP (Standard Operating Procedure) assistant.
Your job is to convert raw text (emails, policies, documents) into clear, structured workflows.

Requirements:
1. Extract key steps from the text
2. Order steps logically
3. Assign roles/departments where mentioned
4. Each step should be: title (short), description (detailed), role (optional)
5. Return ONLY valid JSON, no markdown
6. No extra text before or after JSON

JSON Format:
{
  "title": "Workflow Name",
  "description": "Brief workflow description",
  "steps": [
    {
      "title": "Step title",
      "description": "What to do and why",
      "role": "Department/Role or null"
    }
  ]
  
}
"""

def generate_sop(raw_text: str) -> dict:
    """Convert raw text to structured SOP using Gemini"""
    try:
        client = get_gemini_client()
        model = settings.GEMINI_MODEL
        
        print(f"[AI] Attempting to use model: {model}")
        print(f"[AI] API Key configured: {'Yes' if settings.GEMINI_API_KEY else 'No'}")
        print(f"[AI] Input text length: {len(raw_text)} chars")
        
        print(f"[AI] Model created, sending request...")
        
        response = client.models.generate_content(
            model=model,
            contents=f"{SYSTEM_PROMPT}\n\nConvert this to a workflow:\n\n{raw_text}",
            config=types.GenerateContentConfig(
                temperature=0.2,
                max_output_tokens=2000,
                top_p=0.9,
            )
        )
        
        print(f"[AI] Response received")
        content = response.text.strip()
        print(f"[AI] Raw response: {content[:200]}...")
        
        # Clean up markdown code blocks if present
        if content.startswith("```json"):
            content = content.replace("```json", "").replace("```", "").strip()
        elif content.startswith("```"):
            content = content.replace("```", "").strip()
        
        workflow_data = json.loads(content)
        print(f"[AI] Parsed workflow: {workflow_data.get('title', 'No title')}")
        
        return {
            "success": True,
            "workflow": workflow_data
        }
    
    except json.JSONDecodeError as e:
        print(f"[AI] JSON parse error: {e}")
        return {
            "success": False,
            "error": f"Invalid JSON response: {str(e)}",
            "raw_response": content if 'content' in locals() else None
        }
    
    except Exception as e:
        print(f"[AI] Error: {type(e).__name__}: {e}")
        return {
            "success": False,
            "error": f"Gemini API error: {str(e)}"
        }

def rewrite_step(step_text: str, tone: str = "clear_enterprise") -> dict:
    """Rewrite step using Gemini"""
    try:
        client = get_gemini_client()
        model = settings.GEMINI_MODEL or "gemini-2.0-flash-001"
        
        tone_instructions = {
            "clear_enterprise": "Rewrite to be professional, clear, and actionable",
            "technical": "Rewrite with technical details and precision",
            "simple": "Rewrite in simple, non-technical language"
        }
        
        instruction = tone_instructions.get(tone, tone_instructions["clear_enterprise"])
        system_instruction = f"{instruction}. Keep it concise (1-2 sentences)."
        
        response = client.models.generate_content(
            model=model,
            contents=f"{system_instruction}\n\n{step_text}",
            config=types.GenerateContentConfig(
                temperature=0.3,
                max_output_tokens=500,
            )
        )
        
        rewritten_text = response.text.strip()
        
        return {
            "success": True,
            "original_text": step_text,
            "rewritten_text": rewritten_text
        }
    
    except Exception as e:
        return {
            "success": False,
            "error": f"Rewrite failed: {str(e)}"
        }

def save_workflow_to_db(workflow_data: dict, organization_id: str, user_id: str) -> dict:
    """Save workflow + steps using Supabase REST (no SDK)."""
    try:
        # 1) Insert workflow
        workflow_rows = sb_insert(
            "workflows",
            {
                "title": workflow_data.get("title"),
                "description": workflow_data.get("description"),
                "organization_id": organization_id,
                "created_by": user_id,
                "status": "draft",
            },
        )
        workflow_id = workflow_rows[0]["id"]

        # 2) Insert steps
        steps = workflow_data.get("steps", [])
        if steps:
            steps_payload = []
            for idx, step in enumerate(steps):
                steps_payload.append(
                    {
                        "workflow_id": workflow_id,
                        "title": step.get("title"),
                        "description": step.get("description"),
                        "assigned_to": None,
                        "status": "pending",
                        "order": idx,
                    }
                )
            sb_insert("workflow_steps", steps_payload)

        return {
            "success": True,
            "workflow_id": workflow_id,
            "steps_created": len(steps),
        }

    except Exception as e:
        return {
            "success": False,
            "error": f"Database save failed: {str(e)}",
        }

