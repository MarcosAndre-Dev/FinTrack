from fastapi import APIRouter, Depends, HTTPException, Header
from sqlalchemy.orm import Session
import requests
import os

from backend.app.infrastructure.database.connection import get_db
from backend.app.presentation.controllers.transacao_controller import TransacaoController
from backend.app.application.dtos.transacao_dto import TransacaoCreateDTO

router = APIRouter(prefix="/transacoes", tags=["transacoes"])

SECRET_KEY = os.environ.get("SECRET_KEY", "dev-inseguro-trocar-em-producao")
ALGORITHM = "HS256"


def get_usuario_id(authorization: str = Header(...)) -> int:
    """Extrai e valida o token JWT, retornando o usuario_id."""
    from jose import jwt, JWTError
    try:
        scheme, token = authorization.split(" ")
        if scheme.lower() != "bearer":
            raise ValueError()
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        usuario_id: int = payload.get("id")
        if usuario_id is None:
            raise ValueError()
        return usuario_id
    except Exception:
        raise HTTPException(status_code=401, detail="Token inválido ou expirado")


@router.get("/")
def listar(
    mes: int = None,
    ano: int = None,
    db: Session = Depends(get_db),
    usuario_id: int = Depends(get_usuario_id)
):
    try:
        transacoes = TransacaoController(db, usuario_id).listar(mes=mes, ano=ano)

        response = requests.get("https://economia.awesomeapi.com.br/json/last/USD-BRL")
        cotacao = float(response.json()["USDBRL"]["bid"]) if response.status_code == 200 else None

        return {"transacoes": transacoes, "cotacao_dolar": cotacao}
    except HTTPException:
        raise
    except Exception:
        raise HTTPException(status_code=500, detail="Erro ao buscar dados")


@router.post("/", status_code=201)
def criar(payload: TransacaoCreateDTO, db: Session = Depends(get_db), usuario_id: int = Depends(get_usuario_id)):
    try:
        return TransacaoController(db, usuario_id).criar(payload)
    except ValueError as e:
        raise HTTPException(status_code=422, detail=str(e))


@router.delete("/{id}", status_code=200)
def deletar(id: int, db: Session = Depends(get_db), usuario_id: int = Depends(get_usuario_id)):
    try:
        TransacaoController(db, usuario_id).deletar(id)
        return {"detail": "Transação deletada com sucesso"}
    except ValueError as e:
        raise HTTPException(status_code=404, detail=str(e))


@router.get("/resumo")
def resumo(
    mes: int = None,
    ano: int = None,
    db: Session = Depends(get_db),
    usuario_id: int = Depends(get_usuario_id)
):
    return TransacaoController(db, usuario_id).resumo(mes=mes, ano=ano)


@router.get("/evolucao")
def evolucao(db: Session = Depends(get_db), usuario_id: int = Depends(get_usuario_id)):
    try:
        return TransacaoController(db, usuario_id).evolucao()
    except Exception:
        raise HTTPException(status_code=500, detail="Erro ao buscar evolução")