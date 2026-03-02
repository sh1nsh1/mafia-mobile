from .camel_model import CamelModel


class TokenPairDTO(CamelModel):
    access_token: str
    refresh_token: str
