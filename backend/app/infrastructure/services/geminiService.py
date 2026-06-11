import os
from dotenv import load_dotenv
from groq import Groq

load_dotenv()

client = Groq(api_key=os.environ.get("GROQ_API_KEY"))

def gerar_conselho_financeiro(transacoes: list) -> str:
    try:
        if not transacoes:
            return "Você ainda não tem transações registradas. Comece registrando suas receitas e despesas!"

        resumo = ""
        total_receitas = 0
        total_despesas = 0

        for t in transacoes:
            if t.tipo == "receita":
                total_receitas += t.valor
            else:
                total_despesas += t.valor
            resumo += f"- {t.tipo}: R${t.valor:.2f} em {t.categoria}\n"

        saldo = total_receitas - total_despesas

        prompt = f"""
        Você é um consultor financeiro pessoal. Analise as transações abaixo e dê conselhos financeiros práticos e personalizados em português brasileiro.

        Transações do usuário:
        {resumo}

        Resumo:
        - Total de receitas: R${total_receitas:.2f}
        - Total de despesas: R${total_despesas:.2f}
        - Saldo: R${saldo:.2f}

        Dê conselhos objetivos e motivadores em no máximo 5 frases.
        """

        response = client.chat.completions.create(
            model="llama-3.1-8b-instant",
            messages=[{"role": "user", "content": prompt}],
            max_tokens=500
        )

        return response.choices[0].message.content

    except Exception as e:
        print(f"ERRO GROQ: {e}")
        return "Não foi possível gerar conselhos no momento. Tente novamente mais tarde."