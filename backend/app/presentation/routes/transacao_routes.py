from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from backend.app.infrastructure.database.connection import get_db
from backend.app.presentation.controllers.transacao_controller import TransacaoController
from backend.app.application.dtos.transacao_dto import TransacaoCreateDTO
from backend.app.domain.tipoCategory.tipoCategoria import TransacaoCreate,model_validator

router = APIRouter(prefix="/transacoes", tags=["transacoes"])

@router.get("/")
def listar(db: Session = Depends(get_db)):
    return TransacaoController(db).listar()

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

@router.post("/Categoria")
def mostraCategoria(transacao: TransacaoCreate): 
    return {"status": "sucesso"}