class AIOutput:
    """AI output tracking model (Gemini)"""
    
    @staticmethod
    def save(db, workflow_id: str, raw_text: str, structured_output: dict, model: str = "gemini-2.5-pro") -> dict:
        """Save AI output for audit trail"""
        ai_data = {
            "workflow_id": workflow_id,
            "raw_text": raw_text,
            "structured_output": structured_output,
            "model_used": model
        }
        return db.table("ai_outputs").insert(ai_data).execute().data
