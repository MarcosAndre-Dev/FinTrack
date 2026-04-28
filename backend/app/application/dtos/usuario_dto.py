from pydantic import BaseModel

class UsuarioCreateDTO(BaseModel):
    nome: str
    email: str
    senha: str

class LoginDTO(BaseModel):
    email: str
    senha: str