from domain.entities.user import User
from datetime import datetime
from typing import List
# from infrastructure.database.models.lobby_model import LobbyModel


class Lobby:
    lobby_id: str

    admin: User
    player_max_count: int
    users: List[User]
    created_at: datetime
    # lobby_config: LobbyConfig TODO

    def __init__(self, admin: User, player_max_count: int, **kwargs):
        self.admin = admin
        self.player_max_count = player_max_count
        self.users = [admin]
        self.id = kwargs.get("id")
        self.created_at = kwargs.get("created_at")
