from sqlalchemy import func
from sqlalchemy.orm import Session
from backend.app.application.use_cases.criar_transacao import CriarTransacao
from backend.app.application.use_cases.listar_transacoes import ListarTransacoes
from backend.app.application.use_cases.deletar_transacao import DeletarTransacao
from backend.app.application.dtos.transacao_dto import TransacaoCreateDTO
from backend.app.infrastructure.repositories.transacao_repository_impl import TransacaoRepositoryImpl
from backend.app.infrastructure.database.models import TransacaoModel

class TransacaoController:

    def __init__(self, db: Session):
        self.repository = TransacaoRepositoryImpl(db)
        self.db = db

    def criar(self, dto: TransacaoCreateDTO):
        return CriarTransacao(self.repository).executar(dto)

    def listar(self):
        return ListarTransacoes(self.repository).executar()

    def deletar(self, id: int):
        return DeletarTransacao(self.repository).executar(id)

    def resumo(self):
        receitas = self.db.query(func.sum(TransacaoModel.valor)).filter(TransacaoModel.tipo == "receita").scalar() or 0.0
        despesas = self.db.query(func.sum(TransacaoModel.valor)).filter(TransacaoModel.tipo == "despesa").scalar() or 0.0
        saldo = receitas - despesas

        categorias_raw = (
            self.db.query(TransacaoModel.categoria, func.sum(TransacaoModel.valor).label("total"))
            .filter(TransacaoModel.tipo == "despesa")
            .group_by(TransacaoModel.categoria)
            .order_by(func.sum(TransacaoModel.valor).desc())
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