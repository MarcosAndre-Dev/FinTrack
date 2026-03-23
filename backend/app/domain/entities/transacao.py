from dataclasses import dataclass, field
from datetime import date
from typing import Optional

@dataclass
class Transacao:
    tipo: str
    valor: float
    categoria: str
    descricao: Optional[str] = ""
    data: date = field(default_factory=date.today)
    id: Optional[int] = None

    def validar(self):
        if self.tipo not in ("receita", "despesa"):
            raise ValueError("tipo deve ser 'receita' ou 'despesa'")
        if self.valor <= 0:
            raise ValueError("valor deve ser maior que zero")
        if not self.categoria:
            raise ValueError("categoria é obrigatória")