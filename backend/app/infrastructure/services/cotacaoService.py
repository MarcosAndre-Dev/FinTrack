import requests

class CotacaoService:
    @staticmethod
    def obter_cotacao_dolar():
        url = "https://economia.awesomeapi.com.br/json/last/USD-BRL"

        response = requests.get(url)

        if response.status_code != 200:
            raise Exception("Erro ao buscar cotação")

        data = response.json()

        return float(data["USDBRL"]["bid"])