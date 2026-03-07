from presentation.api.v1.dtos.base_dto import BaseDTO


class LobbyCreateDTO(BaseDTO):
    max_players: int
