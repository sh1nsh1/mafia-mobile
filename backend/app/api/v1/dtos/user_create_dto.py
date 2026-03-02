from pydantic import BaseModel


class UserCreateDTO(BaseModel):
    username: str
    email: str
    password: str
