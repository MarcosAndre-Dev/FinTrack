from pydantic import BaseModel
from typing import Optional

class TransacaoCreate(BaseModel):
    tipo: str  
    valor: float
    categoria: str
    descricao: Optional[str] = ""