from pydantic import BaseModel


class LobbyCreateDTO(BaseModel):
    max_players: int
