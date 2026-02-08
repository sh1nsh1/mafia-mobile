from typing import List, Optional
from datetime import datetime


class LobbyModel:
    def __init__(self,
                 id: str,
                 admin_id: str,
                 max_players: int,
                 participant_ids: List[str],
                 created_at: Optional[str] = None,
                 game_id: Optional[str] = None,
                 ):
        self.id = id
        self.admin_id = admin_id
        self.game_id = game_id or "no_game"
        self.max_players = max_players
        self.participant_ids = participant_ids or []
        self.created_at = created_at or datetime.now().isoformat()

    def to_dict(self):
        return {
            "id": self.id,
            "admin_id": self.admin_id,
            "game_id": self.game_id,
            "max_players": self.max_players,
            # "participant_ids": self.participant_ids,
            "created_at": self.created_at,
        }

    @classmethod
    def from_redis_data(cls, data):
        return cls(
            id=data["id"],
            admin_id=data["admin_id"],
            game_id=data["game_id"],
            max_players=int(data["max_players"]),
            participant_ids=data["participant_ids"],
            created_at=data["created_at"]
        )
