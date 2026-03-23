from sqlalchemy.orm import Session
from backend.app.domain.entities.transacao import Transacao
from backend.app.domain.repositories.transacao_repository import TransacaoRepository
from backend.app.infrastructure.database.models import TransacaoModel

class TransacaoRepositoryImpl(TransacaoRepository):

    def __init__(self, db: Session):
        self.db = db

    def salvar(self, transacao: Transacao) -> Transacao:
        model = TransacaoModel(
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

    def listar(self) -> list[Transacao]:
        models = self.db.query(TransacaoModel).order_by(TransacaoModel.data.desc()).all()
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
        m = self.db.query(TransacaoModel).filter(TransacaoModel.id == id).first()
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
        m = self.db.query(TransacaoModel).filter(TransacaoModel.id == id).first()
        if m:
            self.db.delete(m)
            self.db.commit()