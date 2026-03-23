from backend.app.domain.entities.transacao import Transacao
from backend.app.domain.repositories.transacao_repository import TransacaoRepository
from backend.app.application.dtos.transacao_dto import TransacaoCreateDTO

class CriarTransacao:
    def __init__(self, repository: TransacaoRepository):
        self.repository = repository

    def executar(self, dto: TransacaoCreateDTO) -> Transacao:
        transacao = Transacao(
            tipo=dto.tipo,
            valor=dto.valor,
            categoria=dto.categoria,
            descricao=dto.descricao,
        )
        transacao.validar()
        return self.repository.salvar(transacao)