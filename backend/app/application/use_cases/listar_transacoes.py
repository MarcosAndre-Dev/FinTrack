from backend.app.domain.repositories.transacao_repository import TransacaoRepository
from backend.app.domain.entities.transacao import Transacao

class ListarTransacoes:
    def __init__(self, repository: TransacaoRepository):
        self.repository = repository

    def executar(self, mes: int = None, ano: int = None) -> list[Transacao]:
        return self.repository.listar(mes=mes, ano=ano)