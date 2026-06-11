from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from backend.app.infrastructure.database.connection import get_db
from backend.app.infrastructure.database.models import TransacaoModel
from backend.app.infrastructure.services.geminiService import gerar_conselho_financeiro
from backend.app.presentation.routes.auth_routes import SECRET_KEY, ALGORITHM
from jose import jwt, JWTError
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials

router = APIRouter(prefix="/conselhos", tags=["conselhos"])
security = HTTPBearer()

def get_usuario_id(credentials: HTTPAuthorizationCredentials = Depends(security)):
    try:
        payload = jwt.decode(credentials.credentials, SECRET_KEY, algorithms=[ALGORITHM])
        return payload.get("id")
    except JWTError:
        raise HTTPException(status_code=401, detail="Token inválido")

@router.get("/")
def obter_conselho(
    usuario_id: int = Depends(get_usuario_id),
    db: Session = Depends(get_db)
):
    transacoes = db.query(TransacaoModel).filter(
        TransacaoModel.usuario_id == usuario_id
    ).all()

    conselho = gerar_conselho_financeiro(transacoes)
    return {"conselho": conselho}