from fastapi import APIRouter
from fastapi.staticfiles import StaticFiles
from fastapi.responses import FileResponse

router = APIRouter()

@router.get("/")
def serve_frontend():
    return FileResponse("app/Interface/index.html")