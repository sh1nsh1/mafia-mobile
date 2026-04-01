from presentation.api.v1.dtos.base_dto import BaseDTO


class LobbyCreate(BaseDTO):
    max_players: int
