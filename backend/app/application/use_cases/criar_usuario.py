from backend.app.domain.entities.usuario import Usuario
from backend.app.domain.repositories.usuario_repository import UsuarioRepository
from backend.app.application.dtos.usuario_dto import UsuarioCreateDTO
from passlib.context import CryptContext

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

class CriarUsuario:
    def __init__(self, repository: UsuarioRepository):
        self.repository = repository

    def executar(self, dto: UsuarioCreateDTO) -> Usuario:
        existente = self.repository.buscar_por_email(dto.email)
        if existente:
            raise ValueError("E-mail já cadastrado.")

        usuario = Usuario(
            nome=dto.nome,
            email=dto.email,
            senha=pwd_context.hash(dto.senha),  
        )
        usuario.validar()
        return self.repository.salvar(usuario)