# FinTrack – Controle de Gastos Pessoais

## 📌 Descrição do Projeto

FinTrack é um sistema completo de controle de gastos pessoais, desenvolvido para ajudar pessoas a organizarem melhor sua vida financeira de forma prática e eficiente.

O sistema permite **registrar entradas de dinheiro**, como salário ou outras fontes de renda, e **adicionar despesas do dia a dia**, categorizando gastos em áreas como estudo, lazer, alimentação e dívidas. Além disso, a aplicação fornece **mensagens e sugestões automáticas** baseadas nos hábitos de consumo do usuário, ajudando a reduzir gastos desnecessários e a ter maior consciência financeira.

A aplicação é construída com **FastAPI** para backend, **SQLAlchemy** para gerenciamento de banco de dados, e **Pydantic** para validação de dados e definição de modelos. A interface é **gráfica (GUI)**, tornando a interação mais intuitiva e acessível, permitindo que usuários visualizem facilmente seu saldo, cadastrem receitas e despesas, e recebam alertas sobre seus hábitos financeiros. O projeto também inclui **testes automatizados** com `unittest` e análise de qualidade de código via `flake8`.

A motivação do projeto surge da constatação de que muitas pessoas atualmente não acompanham seus gastos de forma consciente, o que pode gerar dificuldades financeiras e falta de planejamento. FinTrack busca oferecer uma ferramenta simples, prática e útil, promovendo **maior controle financeiro, organização e planejamento do dinheiro** no dia a dia.

---

## 🛠 Funcionalidades

- Adicionar receitas (ex.: salário, bônus)  
- Registrar despesas em categorias: estudo, lazer, alimentação, dívidas  
- Visualizar saldo atualizado  
- Receber mensagens e sugestões baseadas nos gastos  
- Interface **GUI** intuitiva e acessível  

---

## 💻 Tecnologias Utilizadas

- Python 3.x  
- **FastAPI** – framework web para backend/API  
- **SQLAlchemy** – ORM para banco de dados  
- **Pydantic** – validação de dados e definição de modelos  
- Bibliotecas padrão do Python: `datetime`, `typing`  
- Testes automatizados com `unittest`  
- Linting com `flake8`  
- Integração Contínua com **GitHub Actions**  

---

## 📦 Instalação

1. Clone o repositório:

```bash
git clone https://github.com/MarcosAndre-Dev/FinTrack.git
cd FinTrack