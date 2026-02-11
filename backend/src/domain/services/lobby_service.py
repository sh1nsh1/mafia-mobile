from datetime import datetime

from domain.entities.lobby import Lobby
from domain.entities.user import User


class LobbyDService:
    async def prepair_to_game(self, admin: User, player_max_count: int, lobby_config, start_date: datetime) -> Lobby:
        lobby = Lobby(admin, player_max_count)
        return lobby
