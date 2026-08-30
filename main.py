"""
FastAPI Server & REST API Gateway for GuardianAI ADK Agent.
Exposes POST /api/audit and serves frontend assets.
"""

import os
from typing import Optional, List, Dict, Any
from fastapi import FastAPI, HTTPException, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from fastapi.responses import FileResponse
from pydantic import BaseModel, Field

from agent import run_compliance_audit, search_gdpr_clauses, scan_data_schema, generate_remediation_task

app = FastAPI(
    title="GuardianAI - GDPR Compliance & Audit Agent API",
    description="Autonomous GDPR Project Compliance & Privacy Engineering Audit Service powered by Google ADK.",
    version="1.0.0"
)

# Enable CORS for development and cross-origin access
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

class AuditRequest(BaseModel):
    projectName: Optional[str] = Field(default="Untitled Project", description="Project Name or Architectural Specification")
    schemaText: str = Field(..., description="Database DDL, JSON Schema, or Architectural Spec")
    encryptionAtRest: Optional[bool] = Field(default=False, description="Whether encryption at rest is configured")
    consentMechanism: Optional[bool] = Field(default=False, description="Whether an active consent tracking table / banner exists")
    retentionPolicy: Optional[bool] = Field(default=False, description="Whether automated retention TTLs exist")

@app.get("/api/health")
async def health_check():
    return {
        "status": "healthy",
        "agent": "GuardianAI",
        "model": "gemini-3.7-flash",
        "adk": "Google Agent Development Kit"
    }

@app.post("/api/audit")
async def execute_audit(request: AuditRequest):
    if not request.schemaText.strip():
        raise HTTPException(status_code=400, detail="Schema or project specification text cannot be empty.")
    
    try:
        result = run_compliance_audit(
            project_name=request.projectName or "Untitled Project",
            schema_text=request.schemaText,
            encryption_at_rest=bool(request.encryptionAtRest),
            consent_mechanism=bool(request.consentMechanism),
            retention_policy=bool(request.retentionPolicy)
        )
        return result
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Audit execution error: {str(e)}")

# Mount static build folder if running in containerized production mode
dist_path = os.path.join(os.path.dirname(__file__), "dist")
if os.path.exists(dist_path):
    app.mount("/assets", StaticFiles(directory=os.path.join(dist_path, "assets")), name="assets")
    
    @app.get("/{full_path:path}")
    async def serve_spa(full_path: str):
        file_path = os.path.join(dist_path, full_path)
        if os.path.isfile(file_path):
            return FileResponse(file_path)
        return FileResponse(os.path.join(dist_path, "index.html"))

if __name__ == "__main__":
    import uvicorn
    port = int(os.environ.get("PORT", 8080))
    uvicorn.run("main:app", host="0.0.0.0", port=port, reload=True)
