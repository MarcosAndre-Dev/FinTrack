from app.banco.configBase import get_db
from app.banco.tables import Transacao
from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from app.src.functions import resumo_financeiro

router = APIRouter()

@router.get("/transacoes")
def listar_transacoes(db: Session = Depends(get_db)):
    return db.query(Transacao).order_by(Transacao.data.desc()).all()

@router.get("/resumo")
def listar(db: Session = Depends(get_db)):
    return resumo_financeiro(db)