from .camel_model import CamelModel


class UserCreateResponse(CamelModel):
    status: str
    message: str
    access_token: str
    refresh_token: str
