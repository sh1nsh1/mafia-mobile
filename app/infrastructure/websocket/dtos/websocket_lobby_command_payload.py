from uuid import UUID

from domain.enums import RoleEnum, WebSocketLobbyCommandTypeEnum
from infrastructure.websocket.dtos.base_websocket_message import BaseWebSocketMessage


class WebSocketLobbyCommandPayload(BaseWebSocketMessage):
    action_type: WebSocketLobbyCommandTypeEnum
    actor_id: UUID
    target_id: UUID | None
    room_id: str
    role_set: list[RoleEnum] | None
