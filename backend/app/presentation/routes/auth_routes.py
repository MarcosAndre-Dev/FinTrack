from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from backend.app.infrastructure.database.connection import get_db
from backend.app.infrastructure.repositories.usuario_repository_impl import UsuarioRepositoryImpl
from backend.app.application.use_cases.criar_usuario import CriarUsuario
from backend.app.application.use_cases.login_usuario import LoginUsuario
from backend.app.application.dtos.usuario_dto import UsuarioCreateDTO, LoginDTO

router = APIRouter(prefix="/auth", tags=["auth"])

@router.post("/register", status_code=201)
def register(payload: UsuarioCreateDTO, db: Session = Depends(get_db)):
    try:
        repository = UsuarioRepositoryImpl(db)
        usuario = CriarUsuario(repository).executar(payload)
        return {"mensagem": "Conta criada com sucesso.", "nome": usuario.nome}
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))

@router.post("/login")
def login(payload: LoginDTO, db: Session = Depends(get_db)):
    try:
        repository = UsuarioRepositoryImpl(db)
        resultado = LoginUsuario(repository).executar(payload)
        return resultado
    except ValueError as e:
        raise HTTPException(status_code=401, detail=str(e))