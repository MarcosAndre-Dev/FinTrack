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


def test_filtrar_por_periodo(db):
    from backend.app.infrastructure.repositories.transacao_repository_impl import TransacaoRepositoryImpl
    from backend.app.domain.entities.transacao import Transacao
    from datetime import date

    uid = _criar_usuario(db)
    repo = TransacaoRepositoryImpl(db, uid)

    repo.salvar(Transacao(tipo="receita", valor=100.0, categoria="Freelance", data=date(2026, 5, 15)))
    repo.salvar(Transacao(tipo="despesa", valor=50.0, categoria="Alimentação", data=date(2026, 6, 1)))
    repo.salvar(Transacao(tipo="despesa", valor=30.0, categoria="Transporte", data=date(2026, 6, 20)))

    assert len(repo.listar()) == 3

    junho = repo.listar(mes=6, ano=2026)
    assert len(junho) == 2
    assert junho[0].categoria in ("Alimentação", "Transporte")

    maio = repo.listar(mes=5, ano=2026)
    assert len(maio) == 1
    assert maio[0].categoria == "Freelance"

    ano_2026 = repo.listar(ano=2026)
    assert len(ano_2026) == 3


def test_evolucao_mensal(db):
    from backend.app.presentation.controllers.transacao_controller import TransacaoController
    from backend.app.infrastructure.repositories.transacao_repository_impl import TransacaoRepositoryImpl
    from backend.app.domain.entities.transacao import Transacao
    from datetime import date

    uid = _criar_usuario(db)
    repo = TransacaoRepositoryImpl(db, uid)

    repo.salvar(Transacao(tipo="receita", valor=2000.0, categoria="Salário", data=date(2026, 5, 1)))
    repo.salvar(Transacao(tipo="despesa", valor=500.0, categoria="Lazer", data=date(2026, 5, 10)))
    repo.salvar(Transacao(tipo="receita", valor=3000.0, categoria="Salário", data=date(2026, 6, 1)))
    repo.salvar(Transacao(tipo="despesa", valor=1200.0, categoria="Alimentação", data=date(2026, 6, 15)))

    controller = TransacaoController(db, uid)
    evolucao = controller.evolucao()

    assert len(evolucao) == 2
    assert evolucao[0]["mes_nome"] == "Mai/26"
    assert evolucao[0]["receitas"] == 2000.0
    assert evolucao[0]["despesas"] == 500.0
    assert evolucao[0]["saldo"] == 1500.0

    assert evolucao[1]["mes_nome"] == "Jun/26"
    assert evolucao[1]["receitas"] == 3000.0
    assert evolucao[1]["despesas"] == 1200.0
    assert evolucao[1]["saldo"] == 1800.0