from backend.app.infrastructure.database.models import TransacaoModel
from datetime import date

def test_criar_transacao(db):
    transacao = TransacaoModel(
        tipo="receita",
        valor=1500.00,
        categoria="Salário",
        descricao="Salário de março"
    )
    db.add(transacao)
    db.commit()

    resultado = db.query(TransacaoModel).first()
    assert resultado.tipo == "receita"
    assert resultado.valor == 1500.00
    assert resultado.categoria == "Salário"

def test_data_padrao(db):
    transacao = TransacaoModel(
        tipo="despesa",
        valor=50.00,
        categoria="Alimentação"
    )
    db.add(transacao)
    db.commit()

    resultado = db.query(TransacaoModel).first()
    assert resultado.data == date.today()

def test_descricao_opcional(db):
    transacao = TransacaoModel(
        tipo="despesa",
        valor=100.00,
        categoria="Transporte",
        descricao=None
    )
    db.add(transacao)
    db.commit()

    resultado = db.query(TransacaoModel).first()
    assert resultado.descricao is None

def test_multiplas_transacoes(db):
    for i in range(3):
        db.add(TransacaoModel(tipo="despesa", valor=float(i * 10), categoria="Lazer"))
    db.commit()

    assert db.query(TransacaoModel).count() == 3