from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from sqlalchemy import func
from datetime import date
from app.banco.tables import Transacao
from app.banco.configBase import get_db
from app.banco.BaseModel import TransacaoCreate

router = APIRouter()

@router.post("/transacoes", status_code=201)
def criar_transacao(payload: TransacaoCreate, db: Session = Depends(get_db)):
    if payload.tipo not in ("receita", "despesa"):
        raise HTTPException(status_code=422, detail="tipo deve ser 'receita' ou 'despesa'")
    if payload.valor <= 0:
        raise HTTPException(status_code=422, detail="valor deve ser maior que zero")
    nova = Transacao(
        tipo=payload.tipo,
        valor=payload.valor,
        categoria=payload.categoria,
        descricao=payload.descricao,
        data=date.today(),
    )
    db.add(nova)
    db.commit()
    db.refresh(nova)
    return nova

@router.delete("/transacoes/{transacao_id}", status_code=200)
def deletar_transacao(transacao_id: int, db: Session = Depends(get_db)):
    transcoes = db.query(Transacao).filter(Transacao.id == transacao_id).first()
    if not transcoes:
        raise HTTPException(status_code=404, detail="Transação não encontrada")
    db.delete(transcoes)
    db.commit()
    return {"detail": "Transação deletada com sucesso"}

def resumo_financeiro(db: Session = Depends(get_db)):
    receitas = (
        db.query(func.sum(Transacao.valor))
        .filter(Transacao.tipo == "receita")
        .scalar() or 0.0
    )
    despesas = (
        db.query(func.sum(Transacao.valor))
        .filter(Transacao.tipo == "despesa")
        .scalar() or 0.0
    )
    saldo = receitas - despesas

    categorias_raw = (
        db.query(Transacao.categoria, func.sum(Transacao.valor).label("total"))
        .filter(Transacao.tipo == "despesa")
        .group_by(Transacao.categoria)
        .order_by(func.sum(Transacao.valor).desc())
        .all()
    )
    categorias = [{"categoria": c, "total": float(t)} for c, t in categorias_raw]

    maior_categoria = categorias[0] if categorias else None

    dica = None
    if maior_categoria and despesas > 0:
        pct = (maior_categoria["total"] / despesas) * 100
        dica = (
            f"Você gasta {pct:.0f}% das suas despesas em "
            f"'{maior_categoria['categoria']}'. Reduzir essa categoria "
            f"seria o impacto mais rápido no seu saldo."
        )

    return {
        "receitas": float(receitas),
        "despesas": float(despesas),
        "saldo": float(saldo),
        "categorias_despesa": categorias,
        "maior_categoria": maior_categoria,
        "dica_economia": dica,
    }