from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from datetime import datetime
from backend.app.infrastructure.database.connection import get_db
from backend.app.infrastructure.database.models import TransacaoModel, ConselhoModel
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

    # Salva no histórico
    novo = ConselhoModel(
        usuario_id=usuario_id,
        texto=conselho,
        criado_em=datetime.utcnow()
    )
    db.add(novo)
    db.commit()

    return {"conselho": conselho}

@router.get("/historico")
def listar_historico(
    usuario_id: int = Depends(get_usuario_id),
    db: Session = Depends(get_db)
):
    conselhos = (
        db.query(ConselhoModel)
        .filter(ConselhoModel.usuario_id == usuario_id)
        .order_by(ConselhoModel.criado_em.desc())
        .limit(20)
        .all()
    )
    return [
        {
            "id": c.id,
            "texto": c.texto,
            "criado_em": c.criado_em.isoformat() if c.criado_em else None
        }
        for c in conselhos
    ]
