# FinTrack – Controle de Gastos Pessoais

## 📌 Descrição do Projeto

FinTrack é um sistema completo de controle de gastos pessoais, desenvolvido para ajudar pessoas a organizarem melhor sua vida financeira de forma prática e eficiente.

O sistema permite **registrar entradas de dinheiro**, como salário ou outras fontes de renda, e **adicionar despesas do dia a dia**, categorizando gastos em áreas como estudo, lazer, alimentação e dívidas. Além disso, a aplicação fornece **mensagens e sugestões automáticas** baseadas nos hábitos de consumo do usuário, ajudando a reduzir gastos desnecessários e a ter maior consciência financeira.

A interface é **gráfica (GUI) baseada em Web**, tornando a interação mais intuitiva e acessível, permitindo que usuários visualizem facilmente seu saldo, cadastrem receitas e despesas com datas específicas, filtrem por períodos, e acompanhem sua evolução financeira ao longo dos meses.

---

## 🛠 Novas & Principais Funcionalidades

- **Controle de Períodos**: Adicionar transações (receitas/despesas) especificando a data exata.
- **Filtro por Período**: Filtrar a lista de transações e o painel de resumo por mês e ano selecionados.
- **Gráfico de Evolução Mensal**: Visualização gráfica interativa que exibe o total gasto, total recebido e o saldo de cada mês em formato comparativo.
- **Dicas Inteligentes**: Recomendações personalizadas geradas com base na categoria de maior gasto do usuário.
- **Autenticação Segura**: Fluxo completo de cadastro e login usando tokens JWT (JSON Web Tokens).

---

## 💻 Tecnologias Utilizadas

- **Backend**:
  - Python 3.x
  - **FastAPI** – Framework de alta performance para criação de APIs HTTP
  - **SQLAlchemy** – ORM robusto para mapeamento de dados relacioanis
  - **Pydantic** – Validação de tipos e definição de schemas
  - **Python-Jose** – Geração e validação de tokens JWT
  
- **Frontend**:
  - HTML5 & CSS3 estruturados e estilizados sob estética premium escura (Dark Mode)
  - JavaScript Vanilla para consumo assíncrono da API
  - **Chart.js** – Renderização interativa de gráficos de rosca, barras e evolução

- **Qualidade & CI/CD**:
  - Testes automatizados rodando em `pytest`
  - Verificação de estilo PEP 8 com `flake8`
  - Automação de pipelines integrada com **GitHub Actions**
  - Conteinerização com **Docker**

---

## 🗄️ Banco de Dados

A persistência de dados está preparada para dois ambientes:
1. **Local (Desenvolvimento e Testes)**: Utiliza banco de dados em arquivo local SQLite para agilidade no desenvolvimento.
2. **Produção (Nuvem)**: Integrável a banco de dados relacional hospedado na nuvem (PostgreSQL) usando serviços como Supabase, Neon ou MongoDB Atlas por meio da variável de ambiente `DATABASE_URL`.

---

## 📦 Instalação & Uso Local

### 1. Clonar o Repositório
```bash
git clone https://github.com/MarcosAndre-Dev/FinTrack.git
cd FinTrack
```

### 2. Configurar Variáveis de Ambiente
Crie um arquivo `.env` na raiz do projeto ou defina as seguintes variáveis:
```env
DATABASE_URL=sqlite:///./sql_app.db
SECRET_KEY=sua_chave_secreta_jwt_aqui
```

### 3. Execução com Python Direct (Ambiente Virtual)
```bash
# Criar ambiente virtual
python -m venv .venv
# Ativar ambiente virtual (Windows)
.venv\Scripts\activate
# Ativar ambiente virtual (Linux/macOS)
source .venv/bin/activate

# Instalar dependências
pip install -r requirements.txt

# Rodar a aplicação
python run.py
```
Acesse `http://localhost:8000` em seu navegador.

---

## 🐳 Execução via Docker

Para empacotar e rodar a aplicação em contêineres Docker:

### 1. Construir a imagem Docker
```bash
docker build -t fintrack .
```

### 2. Executar o contêiner
```bash
docker run -d -p 8000:8000 --env DATABASE_URL=sqlite:///./sql_app.db fintrack
```
A aplicação estará disponível em `http://localhost:8000`.

---

## 🚀 Deploy

O deploy da aplicação pode ser facilmente realizado em plataformas de hospedagem em nuvem de sua preferência. 

### Render (Recomendado)
1. Crie uma nova aplicação tipo **Web Service** no Render conectada ao seu repositório do GitHub.
2. Defina o **Environment** como `Python` ou configure a opção para ler o **Dockerfile**.
3. Adicione as variáveis de ambiente necessárias (`DATABASE_URL`, `SECRET_KEY`).
4. Execute o build automático a cada commit na branch `main`.

---

## 👥 Integrantes

* **Marcos André Camargo Belo**
  * *E-mail*: marcos.belo@dinfor.uniceub
  * *GitHub*: [MarcosAndre-Dev](https://github.com/MarcosAndre-Dev)
  * *Curso*: Engenharia de Software - UniCEUB (Brasília/DF)
