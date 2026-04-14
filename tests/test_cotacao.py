from backend.app.infrastructure.services.cotacaoService import CotacaoService

def test_cotacao():
    cotacao = CotacaoService.obter_cotacao_dolar()

    assert cotacao > 0