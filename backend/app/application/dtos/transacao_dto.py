from pydantic import BaseModel, field_validator
from typing import Optional
from datetime import date

class TransacaoCreateDTO(BaseModel):
    tipo: str
    valor: float
    categoria: str
    descricao: Optional[str] = ""

    @field_validator("tipo")
    def validar_tipo(cls, v):
        if v not in ("receita", "despesa"):
            raise ValueError("tipo deve ser 'receita' ou 'despesa'")
        return v

    @field_validator("valor")
    def validar_valor(cls, v):
        if v <= 0:
            raise ValueError("valor deve ser maior que zero")
        return v

class TransacaoResponseDTO(BaseModel):
    id: int
    tipo: str
    valor: float
    categoria: str
    descricao: Optional[str]
    data: date

    class Config:
        from_attributes = True
        