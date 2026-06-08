class Usuario:
    def __init__(self, nome: str, email: str, senha: str, id: int = None):
        self.id = id
        self.nome = nome
        self.email = email
        self.senha = senha

    def validar(self):
        if not self.nome or len(self.nome.strip()) < 2:
            raise ValueError("Nome deve ter pelo menos 2 caracteres.")
        if not self.email or "@" not in self.email:
            raise ValueError("E-mail inválido.")
        if not self.senha or len(self.senha) < 6:
            raise ValueError("Senha deve ter pelo menos 6 caracteres.")