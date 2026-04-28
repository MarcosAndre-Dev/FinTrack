from backend.app.domain.repositories.usuario_repository import UsuarioRepository
from backend.app.application.dtos.usuario_dto import LoginDTO
from passlib.context import CryptContext
import secrets

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

class LoginUsuario:
    def __init__(self, repository: UsuarioRepository):
        self.repository = repository

    def executar(self, dto: LoginDTO) -> dict:
        usuario = self.repository.buscar_por_email(dto.email)

        if not usuario:
            raise ValueError("E-mail ou senha incorretos.")

        if not pwd_context.verify(dto.senha, usuario.senha):
            raise ValueError("E-mail ou senha incorretos.")

        token = secrets.token_hex(32)

        return {
            "token": token,
            "nome": usuario.nome,
            "email": usuario.email,
        }