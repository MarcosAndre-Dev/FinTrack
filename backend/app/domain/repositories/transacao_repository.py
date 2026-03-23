from abc import ABC, abstractmethod
from typing import Optional
from backend.app.domain.entities.transacao import Transacao

class TransacaoRepository(ABC):

    @abstractmethod
    def salvar(self, transacao: Transacao) -> Transacao:
        pass

    @abstractmethod
    def listar(self) -> list[Transacao]:
        pass

    @abstractmethod
    def buscar_por_id(self, id: int) -> Optional[Transacao]:
        pass

    @abstractmethod
    def deletar(self, id: int) -> None:
        pass