from uuid import UUID
from dataclasses import dataclass


@dataclass
class LobbyLeaveCommand:
    lobby_id: str
    user_id: UUID
