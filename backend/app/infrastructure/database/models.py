from sqlalchemy import Column, Integer, String, Float, Date
from datetime import date
from backend.app.infrastructure.database.connection import Base

class TransacaoModel(Base):
    __tablename__ = "transacoes"

    id = Column(Integer, primary_key=True, autoincrement=True)
    tipo = Column(String(20), nullable=False)
    valor = Column(Float, nullable=False)
    categoria = Column(String(50), nullable=False)
    descricao = Column(String(150))
    data = Column(Date, default=date.today)
class UsuarioModel(Base):
    __tablename__ = "cadastro"

    id = Column(Integer, primary_key=True, autoincrement=True)
    nome = Column(String(65),nullable=False)
    email = Column(String(65),nullable=False, unique=True, index=True)
    senha = Column(String(100),nullable=False)