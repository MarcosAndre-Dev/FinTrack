from backend.app.domain.repositories.transacao_repository import TransacaoRepository

class DeletarTransacao:
    def __init__(self, repository: TransacaoRepository):
        self.repository = repository

    def executar(self, id: int) -> None:
        transacao = self.repository.buscar_por_id(id)
        if not transacao:
            raise ValueError(f"Transação {id} não encontrada")
        self.repository.deletar(id)