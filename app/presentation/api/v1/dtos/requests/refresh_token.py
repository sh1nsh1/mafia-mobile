from presentation.api.v1.dtos.base_dto import BaseDTO


class RefreshToken(BaseDTO):
    refresh_token: str
