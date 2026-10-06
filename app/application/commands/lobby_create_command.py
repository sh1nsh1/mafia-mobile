from uuid import UUID
from dataclasses import dataclass


@dataclass
class LobbyCreateCommand:
    max_players: int
    admin_id: UUID
