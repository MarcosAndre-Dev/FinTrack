# 📊 FinTrack - Documentação Oficial

Bem-vindo à documentação do FinTrack! Este documento descreve a estrutura do projeto e as principais regras de negócio para facilitar a manutenção e o desenvolvimento futuro.

---

## 🏗️ Arquitetura do Projeto

O FinTrack foi desenvolvido utilizando **FastAPI** no backend e segue os princípios de uma **Arquitetura em Camadas** (Clean Architecture/DDD). Isso garante que o código seja organizado, testável e fácil de evoluir.

O backend está dividido nas seguintes camadas principais:

* **`presentation/` (Apresentação):** * Onde ficam os **Controllers** e as **Rotas** (ex: `transacao_controller.py`). 
  * **Responsabilidade:** Receber a requisição HTTP do frontend (Javascript/Navegador), chamar a camada de aplicação e devolver a resposta (JSON). Não deve conter regras de banco de dados.
* **`application/` (Aplicação):** * Onde ficam os **DTOs** (Data Transfer Objects).
  * **Responsabilidade:** Definir o formato dos dados que entram e saem da API, garantindo validação de tipos (usando Pydantic, por exemplo).
* **`infrastructure/` (Infraestrutura):** * Onde fica a conexão com o banco de dados e repositórios.
  * **Responsabilidade:** Falar diretamente com o banco de dados via **SQLAlchemy** (ex: `connection.py`).

---

## 💼 Regras de Negócio: Transações

Abaixo estão listadas as regras fundamentais que o sistema aplica ao lidar com transações (Entradas e Saídas):

### 1. Criação de Transação (POST)
* **Campos Obrigatórios:** Toda transação deve conter, no mínimo, um `valor` numérico válido e uma `descricao`.
* **Tratamento de Erros:** Se o payload enviado pelo frontend for inválido, a API rejeitará a criação e retornará um erro HTTP estrito (Status Code 422 - Unprocessable Entity).

### 2. Deleção de Transação (DELETE)
* A exclusão é feita pelo `id` da transação.
* **Regra de Existência:** Caso seja solicitada a deleção de um `id` que não existe no banco de dados, o sistema não deve quebrar. Ele deve retornar um erro HTTP `404 Not Found` com a mensagem: *"Transação não encontrada"*.

### 3. Resumo Financeiro (GET /resumo)
* O endpoint de resumo consolida os dados do banco.
* **Prevenção de Valores Nulos:** Se não houver nenhuma transação cadastrada no sistema, o banco de dados pode retornar valores nulos. O sistema trata isso e garante que o frontend receba o valor numérico padrão `0.0`, evitando erros como `NaN` na interface do usuário.

---

## 🚀 Como rodar o projeto localmente

Para iniciar o servidor backend, execute o comando abaixo no terminal:

```bash
uvicorn backend.app.main:app --reload