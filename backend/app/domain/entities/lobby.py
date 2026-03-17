from datetime import datetime

from domain.entities.user import User


class Lobby:
    id: str

    admin: User
    max_players: int
    participants: list[User]
    created_at: str
    # lobby_config: LobbyConfig TODO

    def __init__(
        self,
        id: str,
        admin: User,
        max_players: int,
        partipants: list[User],
        created_at: str,
    ):
        self.id = id
        self.admin = admin
        self.max_players = max_players
        self.participants = partipants or [admin]
        self.created_at = created_at or datetime.now().isoformat()
