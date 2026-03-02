from uuid import UUID

from pydantic import BaseModel


class LobbyJoinResponse(BaseModel):
    status: str
    message: str
    lobby_id: str | None


class LobbyLeaveResponse(BaseModel):
    status: str
    message: str
    lobby_id: str | None


class LobbyResponseDTO(BaseModel):
    status: str
    lobby_id: str | None
    admin_id: UUID | None
    max_players: int | None
    participants: list[UUID] | None
