from sqlalchemy import func
from sqlalchemy.orm import Session
from backend.app.application.use_cases.criar_transacao import CriarTransacao
from backend.app.application.use_cases.listar_transacoes import ListarTransacoes
from backend.app.application.use_cases.deletar_transacao import DeletarTransacao
from backend.app.application.dtos.transacao_dto import TransacaoCreateDTO
from backend.app.infrastructure.repositories.transacao_repository_impl import TransacaoRepositoryImpl
from backend.app.infrastructure.database.models import TransacaoModel


class TransacaoController:

    def __init__(self, db: Session, usuario_id: int):
        self.repository = TransacaoRepositoryImpl(db, usuario_id)
        self.db = db
        self.usuario_id = usuario_id

    def criar(self, dto: TransacaoCreateDTO):
        return CriarTransacao(self.repository).executar(dto)

    def listar(self, mes: int = None, ano: int = None):
        return ListarTransacoes(self.repository).executar(mes=mes, ano=ano)

    def deletar(self, id: int):
        return DeletarTransacao(self.repository).executar(id)

    def resumo(self, mes: int = None, ano: int = None):
        base = self.db.query(TransacaoModel).filter(TransacaoModel.usuario_id == self.usuario_id)

        if ano is not None and mes is not None:
            import calendar
            from datetime import date
            _, last_day = calendar.monthrange(ano, mes)
            base = base.filter(TransacaoModel.data >= date(ano, mes, 1))
            base = base.filter(TransacaoModel.data <= date(ano, mes, last_day))
        elif ano is not None:
            from datetime import date
            base = base.filter(TransacaoModel.data >= date(ano, 1, 1))
            base = base.filter(TransacaoModel.data <= date(ano, 12, 31))

        receitas = base.filter(TransacaoModel.tipo == "receita").with_entities(func.sum(TransacaoModel.valor)).scalar() or 0.0
        despesas = base.filter(TransacaoModel.tipo == "despesa").with_entities(func.sum(TransacaoModel.valor)).scalar() or 0.0
        saldo = receitas - despesas

        categorias_raw = (
            base.filter(TransacaoModel.tipo == "despesa")
            .with_entities(TransacaoModel.categoria, func.sum(TransacaoModel.valor).label("total"))
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

    def evolucao(self):
        transacoes = self.listar()
        from collections import defaultdict
        
        meses_nomes = {
            1: "Jan", 2: "Fev", 3: "Mar", 4: "Abr", 5: "Mai", 6: "Jun",
            7: "Jul", 8: "Ago", 9: "Set", 10: "Out", 11: "Nov", 12: "Dez"
        }
        
        grupos = defaultdict(lambda: {"receitas": 0.0, "despesas": 0.0})
        for t in transacoes:
            key = (t.data.year, t.data.month)
            if t.tipo == "receita":
                grupos[key]["receitas"] += t.valor
            elif t.tipo == "despesa":
                grupos[key]["despesas"] += t.valor
                
        evolucao = []
        for (ano, mes), valores in sorted(grupos.items()):
            rec = valores["receitas"]
            desp = valores["despesas"]
            evolucao.append({
                "ano": ano,
                "mes": mes,
                "mes_nome": f"{meses_nomes.get(mes, '')}/{str(ano)[2:]}",
                "receitas": float(rec),
                "despesas": float(desp),
                "saldo": float(rec - desp)
            })
        return evolucao