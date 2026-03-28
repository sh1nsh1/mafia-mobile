from uuid import UUID

from presentation.api.v1.dtos.base_dto import BaseDTO
from presentation.api.v1.dtos.responses.user_response import UserResponse


class LobbyLeaveResponse(BaseDTO):
    status: str
    message: str
    lobby_id: str | None


class LobbyResponseDTO(BaseDTO):
    status: str
    lobby_id: str | None
    admin_id: UUID | None
    max_players: int | None
    participants: list[UserResponse]
