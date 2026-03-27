from pydantic import BaseModel, model_validator
from typing import Optional

CATEGORIAS_RECEITA = {"Salário", "Freelance", "Investimentos", "Outros Rendimentos"}
CATEGORIAS_DESPESA = {"Alimentação", "Moradia", "Transporte", "Saúde", "Educação", "Lazer", "Vestuário", "Assinaturas", "Outros"}

class TransacaoCreate(BaseModel):
    tipo: str
    valor: float
    categoria: str
    descricao: Optional[str] = ""

    @model_validator(mode="after")
    def validar_categoria_por_tipo(self):
        if self.tipo == "receita" and self.categoria not in CATEGORIAS_RECEITA:
            raise ValueError(f"Categoria '{self.categoria}' não é válida para receitas.")
        if self.tipo == "despesa" and self.categoria not in CATEGORIAS_DESPESA:
            raise ValueError(f"Categoria '{self.categoria}' não é válida para despesas.")
        return self