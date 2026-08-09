import os
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from fastapi.responses import FileResponse
from backend.app.infrastructure.database.connection import Base, engine
from backend.app.infrastructure.database import models
from backend.app.presentation.routes.transacao_routes import router
from backend.app.presentation.routes.auth_routes import router as auth_router
from backend.app.presentation.routes.conselho_routes import router as conselho_router
import sys

def resource_path(relative_path):
    if hasattr(sys, "_MEIPASS"):
        base_path = sys._MEIPASS
    else:
        base_path = os.path.abspath(os.path.join(os.path.dirname(__file__), "..", ".."))
    return os.path.join(base_path, relative_path)

app = FastAPI()

if os.environ.get("TESTING") != "true":
    Base.metadata.create_all(bind=engine)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(router)
app.include_router(auth_router)
app.include_router(conselho_router)
app.mount("/frontend", StaticFiles(directory=resource_path("frontend")), name="static")

@app.get("/")
def serve_frontend():
    return FileResponse(resource_path("frontend/pages/index.html"))

@app.get("/app")
def serve_app_html():
    return FileResponse(resource_path("frontend/pages/app.html"))


if __name__ == "__main__":
    import uvicorn
    port = int(os.environ.get("PORT", 8000))
    uvicorn.run("backend.app.main:app", host="0.0.0.0", port=port)