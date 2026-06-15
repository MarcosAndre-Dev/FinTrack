"""
conselhos_routes.py – Rota de recomendações financeiras via Groq
"""

import os
import httpx
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from sqlalchemy import func

from backend.app.infrastructure.database.connection import get_db
from backend.app.infrastructure.database.models import TransacaoModel
from backend.app.presentation.routes.transacao_routes import get_usuario_id

router = APIRouter(prefix="/conselhos", tags=["conselhos"])

GROQ_API_KEY = os.environ.get("GROQ_API_KEY", "")
GROQ_URL = "https://api.groq.com/openai/v1/chat/completions"
GROQ_MODEL = "llama3-8b-8192"


def _montar_contexto(db: Session, usuario_id: int) -> str:
    """Monta um resumo financeiro do usuário para enviar à IA."""
    base = db.query(TransacaoModel).filter(TransacaoModel.usuario_id == usuario_id)

    receitas = (
        base.filter(TransacaoModel.tipo == "receita")
        .with_entities(func.sum(TransacaoModel.valor))
        .scalar() or 0.0
    )
    despesas = (
        base.filter(TransacaoModel.tipo == "despesa")
        .with_entities(func.sum(TransacaoModel.valor))
        .scalar() or 0.0
    )
    saldo = receitas - despesas

    categorias = (
        base.filter(TransacaoModel.tipo == "despesa")
        .with_entities(
            TransacaoModel.categoria,
            func.sum(TransacaoModel.valor).label("total"),
        )
        .group_by(TransacaoModel.categoria)
        .order_by(func.sum(TransacaoModel.valor).desc())
        .limit(5)
        .all()
    )

    ultimas = (
        base.order_by(TransacaoModel.data.desc())
        .limit(10)
        .all()
    )

    linhas = [
        f"Receitas totais: R$ {receitas:.2f}",
        f"Despesas totais: R$ {despesas:.2f}",
        f"Saldo atual: R$ {saldo:.2f}",
        "",
        "Top categorias de gasto:",
    ]
    for cat, total in categorias:
        pct = (total / despesas * 100) if despesas > 0 else 0
        linhas.append(f"  - {cat}: R$ {total:.2f} ({pct:.0f}% das despesas)")

    linhas.append("")
    linhas.append("Últimas transações:")
    for t in ultimas:
        sinal = "+" if t.tipo == "receita" else "-"
        linhas.append(
            f"  [{t.data}] {sinal}R$ {t.valor:.2f} — {t.categoria}"
            + (f" ({t.descricao})" if t.descricao else "")
        )

    return "\n".join(linhas)


@router.post("/gerar")
async def gerar_conselho(
    db: Session = Depends(get_db),
    usuario_id: int = Depends(get_usuario_id),
):
    if not GROQ_API_KEY:
        raise HTTPException(
            status_code=503,
            detail="GROQ_API_KEY não configurada no servidor.",
        )

    total = (
        db.query(TransacaoModel)
        .filter(TransacaoModel.usuario_id == usuario_id)
        .count()
    )
    if total == 0:
        raise HTTPException(
            status_code=422,
            detail="Adicione ao menos uma transação para receber conselhos.",
        )

    contexto = _montar_contexto(db, usuario_id)

    prompt = f"""Você é um consultor financeiro pessoal direto e prático, especializado em finanças para brasileiros.

Com base no perfil financeiro abaixo, forneça 3 recomendações personalizadas, numeradas, em português do Brasil.
Seja específico, use os dados reais do usuário, evite conselhos genéricos.
Cada recomendação deve ter no máximo 3 linhas. Não use markdown, apenas texto simples.

PERFIL FINANCEIRO:
{contexto}

RECOMENDAÇÕES:"""

    try:
        async with httpx.AsyncClient(timeout=30) as client:
            response = await client.post(
                GROQ_URL,
                headers={
                    "Authorization": f"Bearer {GROQ_API_KEY}",
                    "Content-Type": "application/json",
                },
                json={
                    "model": GROQ_MODEL,
                    "messages": [{"role": "user", "content": prompt}],
                    "max_tokens": 500,
                    "temperature": 0.7,
                },
            )

        if response.status_code != 200:
            raise HTTPException(
                status_code=502,
                detail=f"Erro na API Groq: {response.text}",
            )

        data = response.json()
        texto = data["choices"][0]["message"]["content"].strip()

        return {
            "conselho": texto,
            "contexto_resumo": {
                "receitas": float(
                    db.query(func.sum(TransacaoModel.valor))
                    .filter(
                        TransacaoModel.usuario_id == usuario_id,
                        TransacaoModel.tipo == "receita",
                    )
                    .scalar() or 0
                ),
                "despesas": float(
                    db.query(func.sum(TransacaoModel.valor))
                    .filter(
                        TransacaoModel.usuario_id == usuario_id,
                        TransacaoModel.tipo == "despesa",
                    )
                    .scalar() or 0
                ),
                "total_transacoes": total,
            },
        }

    except httpx.TimeoutException:
        raise HTTPException(status_code=504, detail="Timeout na API Groq.")
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Erro inesperado: {str(e)}")