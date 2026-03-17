from uuid import UUID

from domain.enums import WebSocketActionTypeEnum
from infrastructure.websocket.dtos.base_websocket_message import BaseWebSocketMessage


class WebSocketCommand(BaseWebSocketMessage):
    action_type: WebSocketActionTypeEnum
    actor_id: UUID
    target_id: UUID
    room_id: str
