from pydantic import BaseModel
from typing import Optional
from datetime import date

class TransacaoSchema(BaseModel):
    id: int
    tipo: str
    valor: float
    categoria: str
    descricao: Optional[str]
    data: date

    class Config:
        from_attributes = True

class ResumoSchema(BaseModel):
    receitas: float
    despesas: float
    saldo: float
    categorias_despesa: list[dict]
    maior_categoria: Optional[dict]
    dica_economia: Optional[str]