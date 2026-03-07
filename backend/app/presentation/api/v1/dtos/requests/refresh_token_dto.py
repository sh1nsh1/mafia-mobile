from presentation.api.v1.dtos.base_dto import BaseDTO


class RefreshTokenDTO(BaseDTO):
    refresh_token: str
