from sqlalchemy.orm import Session
from backend.app.domain.entities.transacao import Transacao
from backend.app.domain.repositories.transacao_repository import TransacaoRepository
from backend.app.infrastructure.database.models import TransacaoModel


class TransacaoRepositoryImpl(TransacaoRepository):

    def __init__(self, db: Session, usuario_id: int):
        self.db = db
        self.usuario_id = usuario_id

    def salvar(self, transacao: Transacao) -> Transacao:
        model = TransacaoModel(
            usuario_id=self.usuario_id,
            tipo=transacao.tipo,
            valor=transacao.valor,
            categoria=transacao.categoria,
            descricao=transacao.descricao,
            data=transacao.data,
        )
        self.db.add(model)
        self.db.commit()
        self.db.refresh(model)
        transacao.id = model.id
        return transacao

    def listar(self, mes: int = None, ano: int = None) -> list[Transacao]:
        query = self.db.query(TransacaoModel).filter(TransacaoModel.usuario_id == self.usuario_id)
        if ano is not None and mes is not None:
            import calendar
            from datetime import date
            _, last_day = calendar.monthrange(ano, mes)
            query = query.filter(TransacaoModel.data >= date(ano, mes, 1))
            query = query.filter(TransacaoModel.data <= date(ano, mes, last_day))
        elif ano is not None:
            from datetime import date
            query = query.filter(TransacaoModel.data >= date(ano, 1, 1))
            query = query.filter(TransacaoModel.data <= date(ano, 12, 31))

        models = query.order_by(TransacaoModel.data.desc()).all()
        return [
            Transacao(
                id=m.id,
                tipo=m.tipo,
                valor=m.valor,
                categoria=m.categoria,
                descricao=m.descricao,
                data=m.data,
            )
            for m in models
        ]

    def buscar_por_id(self, id: int) -> Transacao | None:
        m = (
            self.db.query(TransacaoModel)
            .filter(TransacaoModel.id == id, TransacaoModel.usuario_id == self.usuario_id)
            .first()
        )
        if not m:
            return None
        return Transacao(
            id=m.id,
            tipo=m.tipo,
            valor=m.valor,
            categoria=m.categoria,
            descricao=m.descricao,
            data=m.data,
        )

    def deletar(self, id: int) -> None:
        m = (
            self.db.query(TransacaoModel)
            .filter(TransacaoModel.id == id, TransacaoModel.usuario_id == self.usuario_id)
            .first()
        )
        if m:
            self.db.delete(m)
            self.db.commit()