from uuid import UUID

from presentation.api.v1.dtos.base_dto import BaseDTO
from presentation.api.v1.dtos.responses import UserResponse


class LobbyResponse(BaseDTO):
    status: str
    id: str
    admin_id: UUID
    max_players: int
    participants: list[UserResponse]
