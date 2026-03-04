from api.v1.dtos.base_dto import BaseDTO


class UserCreateResponse(BaseDTO):
    status: str
    message: str
    access_token: str
    refresh_token: str
