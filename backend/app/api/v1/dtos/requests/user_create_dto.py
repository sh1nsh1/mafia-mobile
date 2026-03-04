from api.v1.dtos.base_dto import BaseDTO


class UserCreateDTO(BaseDTO):
    username: str
    email: str
    password: str
