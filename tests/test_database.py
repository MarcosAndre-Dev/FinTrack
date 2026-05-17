from backend.app.infrastructure.database.models import TransacaoModel, UsuarioModel
from datetime import date


def _criar_usuario(db):
    """Cria um usuário de teste e retorna o id."""
    usuario = UsuarioModel(nome="Teste", email="teste@teste.com", senha="hash_qualquer")
    db.add(usuario)
    db.commit()
    db.refresh(usuario)
    return usuario.id


def test_criar_transacao(db):
    uid = _criar_usuario(db)
    transacao = TransacaoModel(
        usuario_id=uid,
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
    uid = _criar_usuario(db)
    transacao = TransacaoModel(
        usuario_id=uid,
        tipo="despesa",
        valor=50.00,
        categoria="Alimentação"
    )
    db.add(transacao)
    db.commit()

    resultado = db.query(TransacaoModel).first()
    assert resultado.data == date.today()


def test_descricao_opcional(db):
    uid = _criar_usuario(db)
    transacao = TransacaoModel(
        usuario_id=uid,
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
    uid = _criar_usuario(db)
    for i in range(3):
        db.add(TransacaoModel(usuario_id=uid, tipo="despesa", valor=float(i * 10), categoria="Lazer"))
    db.commit()

    assert db.query(TransacaoModel).count() == 3