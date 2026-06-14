import pytest
from unittest.mock import patch, MagicMock
from fastapi.testclient import TestClient
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker

from backend.app.infrastructure.database.connection import Base, get_db
from backend.app.infrastructure.database.models import UsuarioModel, TransacaoModel
from backend.app.main import app

# Engine unico compartilhado - criado uma vez
engine_test = create_engine(
    "sqlite:///:memory:",
    connect_args={"check_same_thread": False}
)

# Cria as tabelas UMA vez ao carregar o modulo
Base.metadata.create_all(bind=engine_test)

TestingSessionLocal = sessionmaker(bind=engine_test, autocommit=False, autoflush=False)


@pytest.fixture()
def db_session():
    """Cada teste recebe uma conexao com transacao que e revertida ao final."""
    connection = engine_test.connect()
    transaction = connection.begin()
    session = TestingSessionLocal(bind=connection)
    yield session
    session.close()
    transaction.rollback()
    connection.close()


@pytest.fixture(autouse=True)
def override_db(db_session):
    """Substitui o banco real pelo banco de teste em cada teste."""
    def _override():
        yield db_session
    app.dependency_overrides[get_db] = _override
    yield
    app.dependency_overrides.clear()


client = TestClient(app)


def registrar_e_logar():
    """Registra um usuario e retorna o token JWT."""
    client.post("/auth/register", json={
        "nome": "Teste",
        "email": "teste@teste.com",
        "senha": "senha123"
    })
    res = client.post("/auth/login", json={
        "email": "teste@teste.com",
        "senha": "senha123"
    })
    return res.json()["access_token"]


class MockResponse:
    """Simula resposta da awesomeapi sem chamada real."""
    status_code = 200

    def json(self):
        return {"USDBRL": {"bid": "5.25"}}


# =============================================================================
# TESTES DE RESPOSTA
# =============================================================================

def test_register_retorna_token():
    res = client.post("/auth/register", json={
        "nome": "Joao",
        "email": "joao@teste.com",
        "senha": "senha123"
    })
    assert res.status_code == 201
    data = res.json()
    assert "access_token" in data
    assert data["user"]["email"] == "joao@teste.com"


def test_login_retorna_token():
    client.post("/auth/register", json={
        "nome": "Maria",
        "email": "maria@teste.com",
        "senha": "senha123"
    })
    res = client.post("/auth/login", json={
        "email": "maria@teste.com",
        "senha": "senha123"
    })
    assert res.status_code == 200
    assert "access_token" in res.json()


def test_criar_transacao_sucesso():
    token = registrar_e_logar()
    res = client.post("/transacoes/", json={
        "tipo": "receita",
        "valor": 1500.0,
        "categoria": "Salario",
        "descricao": "Salario mensal"
    }, headers={"Authorization": f"Bearer {token}"})
    assert res.status_code == 201


def test_listar_transacoes_com_mock_cotacao():
    token = registrar_e_logar()
    client.post("/transacoes/", json={
        "tipo": "despesa",
        "valor": 50.0,
        "categoria": "Alimentacao"
    }, headers={"Authorization": f"Bearer {token}"})

    with patch("requests.get", return_value=MockResponse()):
        res = client.get("/transacoes/", headers={"Authorization": f"Bearer {token}"})

    assert res.status_code == 200
    data = res.json()
    assert "transacoes" in data
    assert "cotacao_dolar" in data
    assert data["cotacao_dolar"] == 5.25


def test_deletar_transacao_sucesso():
    token = registrar_e_logar()
    criar = client.post("/transacoes/", json={
        "tipo": "despesa",
        "valor": 30.0,
        "categoria": "Transporte"
    }, headers={"Authorization": f"Bearer {token}"})
    transacao_id = criar.json()["id"]
    res = client.delete(f"/transacoes/{transacao_id}",
                        headers={"Authorization": f"Bearer {token}"})
    assert res.status_code == 200


# =============================================================================
# TESTES DE FALHA
# =============================================================================

def test_login_credenciais_invalidas():
    client.post("/auth/register", json={
        "nome": "Ana",
        "email": "ana@teste.com",
        "senha": "correta123"
    })
    res = client.post("/auth/login", json={
        "email": "ana@teste.com",
        "senha": "errada999"
    })
    assert res.status_code == 401


def test_register_email_duplicado():
    dados = {"nome": "Pedro", "email": "pedro@teste.com", "senha": "senha123"}
    client.post("/auth/register", json=dados)
    res = client.post("/auth/register", json=dados)
    assert res.status_code == 409


def test_listar_sem_token_retorna_422():
    res = client.get("/transacoes/")
    assert res.status_code == 422


def test_listar_token_invalido():
    res = client.get("/transacoes/",
                     headers={"Authorization": "Bearer token_falso"})
    assert res.status_code == 401


def test_deletar_transacao_inexistente():
    token = registrar_e_logar()
    res = client.delete("/transacoes/9999",
                        headers={"Authorization": f"Bearer {token}"})
    assert res.status_code == 404


def test_cotacao_falha_api_externa():
    token = registrar_e_logar()
    mock_falha = MagicMock()
    mock_falha.status_code = 503

    with patch("requests.get", return_value=mock_falha):
        res = client.get("/transacoes/",
                         headers={"Authorization": f"Bearer {token}"})

    assert res.status_code == 200
    assert res.json()["cotacao_dolar"] is None