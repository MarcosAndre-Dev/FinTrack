from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from fastapi.responses import FileResponse
from app.banco.database import Base, engine
from app.banco import tables  
from app.src import home, functions, static

app = FastAPI()

Base.metadata.create_all(bind=engine)  

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(home.router)
app.include_router(functions.router)
app.include_router(static.router)

app.mount("/static", StaticFiles(directory="app/Interface"), name="static")