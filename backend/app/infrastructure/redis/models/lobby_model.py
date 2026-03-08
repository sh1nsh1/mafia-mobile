from uuid import UUID
from datetime import datetime


class LobbyModel:
    def __init__(
        self,
        id: str,
        admin_id: str | UUID,
        max_players: int,
        participant_ids: list[str | UUID],
        created_at: str | None = None,
        game_id: str | None = None,
    ):
        self.id = id
        self.admin_id = str(admin_id) if isinstance(admin_id, UUID) else admin_id
        self.game_id = game_id or "no_game"
        self.max_players = max_players
        self.participant_ids: list[str] = []
        for user_id in participant_ids:
            if isinstance(user_id, UUID):
                self.participant_ids.append(str(user_id))
            else:
                self.participant_ids.append(user_id)
        self.created_at = created_at or datetime.now().isoformat()

    def to_dict(self):
        return {
            "id": self.id,
            "admin_id": self.admin_id,
            "game_id": self.game_id,
            "max_players": self.max_players,
            "created_at": self.created_at,
        }

    @classmethod
    def from_redis_data(cls, data: dict[str, any]):
        return cls(
            id=data["id"],
            admin_id=data["admin_id"],
            game_id=data["game_id"],
            max_players=int(data["max_players"]),
            participant_ids=data["participant_ids"],
            created_at=data["created_at"],
        )
