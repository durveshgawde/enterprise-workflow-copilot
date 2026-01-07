from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from datetime import datetime
import os
from app.config import settings

# Import route modules
from app.api.v1 import users, organizations, workflows, steps, comments, ai, activity_logs

# Create FastAPI app
app = FastAPI(
    title="Workflow Copilot API",
    description="Enterprise workflow management backend (Gemini Powered)",
    version="1.0.0",
    docs_url="/docs",
    redoc_url="/redoc"
)

# CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:3000",
        "http://localhost:3001",
        "http://127.0.0.1:3000",
        settings.FRONTEND_URL
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Health check
@app.get("/health")
def health_check():
    return {
        "status": "healthy",
        "timestamp": datetime.utcnow().isoformat(),
        "version": "1.0.0",
        "ai_provider": "Google Gemini"
    }

# Root endpoint
@app.get("/")
def root():
    return {
        "message": "Welcome to Workflow Copilot API (Gemini Powered)",
        "docs": "/docs",
        "redoc": "/redoc"
    }

# Include routers
app.include_router(users.router, prefix="/api/v1/users", tags=["users"])
app.include_router(organizations.router, prefix="/api/v1/organizations", tags=["organizations"])
app.include_router(workflows.router, prefix="/api/v1/workflows", tags=["workflows"])
app.include_router(steps.router, prefix="/api/v1/steps", tags=["steps"])
app.include_router(comments.router, prefix="/api/v1/comments", tags=["comments"])
app.include_router(ai.router, prefix="/api/v1/ai", tags=["ai"])
app.include_router(activity_logs.router, prefix="/api/v1/activity-logs", tags=["activity-logs"])

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(
        "app.main:app",
        host="0.0.0.0",
        port=3001,
        reload=settings.DEBUG
    )
