from presentation.api.v1.dtos.base_dto import BaseDTO


class TokenPairDTO(BaseDTO):
    access_token: str
    refresh_token: str
