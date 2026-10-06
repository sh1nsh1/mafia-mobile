from presentation.api.v1.dtos.base_dto import BaseDTO


class UserCreate(BaseDTO):
    username: str
    email: str
    password: str
