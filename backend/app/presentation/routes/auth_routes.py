"""
auth_routes.py – Rotas de autenticação para o FinTrack
"""

import os
from datetime import datetime, timedelta
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from pydantic import BaseModel, EmailStr

from backend.app.infrastructure.database.connection import get_db
from backend.app.infrastructure.database.models import UsuarioModel

router = APIRouter(prefix="/auth", tags=["auth"])

SECRET_KEY = os.environ.get("SECRET_KEY", "dev-inseguro-trocar-em-producao")
ALGORITHM = "HS256"
TOKEN_EXPIRE_MINUTES = 60 * 24


class RegisterRequest(BaseModel):
    nome: str
    email: EmailStr
    senha: str


class LoginRequest(BaseModel):
    email: EmailStr
    senha: str


class UserOut(BaseModel):
    id: int
    nome: str
    email: str


class TokenResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"
    user: UserOut


def _hash_senha(senha: str) -> str:
    from passlib.context import CryptContext
    pwd_ctx = CryptContext(schemes=["bcrypt"], deprecated="auto")
    return pwd_ctx.hash(senha)


def _verificar_senha(senha: str, hashed: str) -> bool:
    from passlib.context import CryptContext
    pwd_ctx = CryptContext(schemes=["bcrypt"], deprecated="auto")
    return pwd_ctx.verify(senha, hashed)


def _criar_token(data: dict) -> str:
    from jose import jwt
    payload = data.copy()
    payload["exp"] = datetime.utcnow() + timedelta(minutes=TOKEN_EXPIRE_MINUTES)
    return jwt.encode(payload, SECRET_KEY, algorithm=ALGORITHM)


@router.post("/register", response_model=TokenResponse, status_code=201)
def register(body: RegisterRequest, db: Session = Depends(get_db)):
    existente = db.query(UsuarioModel).filter(UsuarioModel.email == body.email).first()
    if existente:
        raise HTTPException(status_code=409, detail="E-mail já cadastrado")

    novo = UsuarioModel(nome=body.nome, email=body.email, senha=_hash_senha(body.senha))
    db.add(novo)
    db.commit()
    db.refresh(novo)

    # id incluído no token para isolar dados por usuário
    token = _criar_token({"sub": novo.email, "nome": novo.nome, "id": novo.id})
    user_out = UserOut(id=novo.id, nome=novo.nome, email=novo.email)
    return TokenResponse(access_token=token, user=user_out)


@router.post("/login", response_model=TokenResponse)
def login(body: LoginRequest, db: Session = Depends(get_db)):
    db_user = db.query(UsuarioModel).filter(UsuarioModel.email == body.email).first()
    if not db_user or not _verificar_senha(body.senha, db_user.senha):
        raise HTTPException(status_code=401, detail="E-mail ou senha incorretos")

    # id incluído no token para isolar dados por usuário
    token = _criar_token({"sub": db_user.email, "nome": db_user.nome, "id": db_user.id})
    user_out = UserOut(id=db_user.id, nome=db_user.nome, email=db_user.email)
    return TokenResponse(access_token=token, user=user_out)


@router.get("/me")
def me():
    raise HTTPException(status_code=501, detail="Implementar autenticação via JWT Bearer")