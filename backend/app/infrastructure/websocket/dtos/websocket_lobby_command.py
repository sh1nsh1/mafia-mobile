from uuid import UUID

from domain.enums import WebSocketLobbyCommandActionTypeEnum
from infrastructure.websocket.dtos.base_websocket_message import BaseWebSocketMessage


class WebSocketLobbyCommand(BaseWebSocketMessage):
    action_type: WebSocketLobbyCommandActionTypeEnum
    actor_id: UUID
    target_id: UUID | None
    room_id: str
