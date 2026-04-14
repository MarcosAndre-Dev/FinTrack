from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
import requests

from backend.app.infrastructure.database.connection import get_db
from backend.app.presentation.controllers.transacao_controller import TransacaoController
from backend.app.application.dtos.transacao_dto import TransacaoCreateDTO

router = APIRouter(prefix="/transacoes", tags=["transacoes"])


@router.get("/")
def listar(db: Session = Depends(get_db)):
    try:
        transacoes = TransacaoController(db).listar()

        response = requests.get("https://economia.awesomeapi.com.br/json/last/USD-BRL")

        if response.status_code != 200:
            cotacao = None
        else:
            data = response.json()
            cotacao = float(data["USDBRL"]["bid"])

        return {
            "transacoes": transacoes,
            "cotacao_dolar": cotacao
        }

    except Exception:
        raise HTTPException(status_code=500, detail="Erro ao buscar dados")


@router.post("/", status_code=201)
def criar(payload: TransacaoCreateDTO, db: Session = Depends(get_db)):
    try:
        return TransacaoController(db).criar(payload)
    except ValueError as e:
        raise HTTPException(status_code=422, detail=str(e))


@router.delete("/{id}", status_code=200)
def deletar(id: int, db: Session = Depends(get_db)):
    try:
        TransacaoController(db).deletar(id)
        return {"detail": "Transação deletada com sucesso"}
    except ValueError as e:
        raise HTTPException(status_code=404, detail=str(e))


@router.get("/resumo")
def resumo(db: Session = Depends(get_db)):
    return TransacaoController(db).resumo()