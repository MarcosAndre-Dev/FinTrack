from sqlalchemy.orm import Session
from backend.app.domain.entities.usuario import Usuario
from backend.app.domain.repositories.usuario_repository import UsuarioRepository
from backend.app.infrastructure.database.models import UsuarioModel

class UsuarioRepositoryImpl(UsuarioRepository):

    def __init__(self, db: Session):
        self.db = db

    def salvar(self, usuario: Usuario) -> Usuario:
        model = UsuarioModel(
            nome=usuario.nome,
            email=usuario.email,
            senha=usuario.senha,
        )
        self.db.add(model)
        self.db.commit()
        self.db.refresh(model)
        usuario.id = model.id
        return usuario

    def buscar_por_email(self, email: str):
        m = self.db.query(UsuarioModel).filter(UsuarioModel.email == email).first()
        if not m:
            return None
        return Usuario(
            id=m.id,
            nome=m.nome,
            email=m.email,
            senha=m.senha,
        )