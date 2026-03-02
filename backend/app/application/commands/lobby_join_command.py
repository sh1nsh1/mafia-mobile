from uuid import UUID
from dataclasses import dataclass


@dataclass
class LobbyJoinCommand:
    lobby_id: str
    user_id: UUID
