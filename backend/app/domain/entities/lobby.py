from datetime import datetime

from domain.entities.user import User


class Lobby:
    id: str

    admin: User
    max_players: int
    participants: list[User]
    created_at: str
    game_id: str | None
    # lobby_config: LobbyConfig TODO

    def __init__(
        self,
        id: str,
        admin: User,
        max_players: int,
        partipants: list[User],
        created_at: str,
        game_id: str | None,
    ):
        self.id = id
        self.admin = admin
        self.max_players = max_players
        self.participants = partipants or [admin]
        self.created_at = created_at or datetime.now().isoformat()
        self.game_id = game_id
