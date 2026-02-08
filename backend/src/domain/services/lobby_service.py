from domain.entities.user import User
from domain.entities.lobby import Lobby
# from infrastructure.database.repositories import LobbyRepository
from datetime import datetime


class LobbyDService:
    async def create_lobby(
        self, admin: User, player_max_count: int, lobby_config, start_date: datetime
    ) -> Lobby:
        lobby = Lobby(admin, player_max_count)
        return lobby

