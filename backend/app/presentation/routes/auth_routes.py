"""
auth_routes.py – Rotas de autenticação para o FinTrack
Coloque em: backend/app/presentation/routes/auth_routes.py

Instale as dependências extras:
    pip install python-jose[cryptography] passlib[bcrypt]
"""

from datetime import datetime, timedelta
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from pydantic import BaseModel, EmailStr


router = APIRouter(prefix="/auth", tags=["auth"])

SECRET_KEY = "TROQUE_POR_UMA_CHAVE_SECRETA_FORTE"   
ALGORITHM  = "HS256"
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
def register(body: RegisterRequest):  
    """
    Cadastra um novo usuário e retorna o token JWT.

    TODO: descomentar a lógica de DB quando o model Usuario estiver pronto.
    """

    mock_user = UserOut(id=1, nome=body.nome, email=body.email)
    token = _criar_token({"sub": body.email, "nome": body.nome})
    return TokenResponse(access_token=token, user=mock_user)


@router.post("/login", response_model=TokenResponse)
def login(body: LoginRequest):  
    """
    Autentica o usuário e retorna o token JWT.
    """

    if body.senha != "teste1234":           
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="E-mail ou senha incorretos"
        )
    mock_user = UserOut(id=1, nome="Usuário Teste", email=body.email)
    token = _criar_token({"sub": body.email})
    return TokenResponse(access_token=token, user=mock_user)


@router.get("/me")
def me():
    """
    Retorna os dados do usuário autenticado.
    TODO: extrair o usuário do JWT (Bearer token no header Authorization).
    """
    raise HTTPException(status_code=501, detail="Implementar autenticação via JWT Bearer")