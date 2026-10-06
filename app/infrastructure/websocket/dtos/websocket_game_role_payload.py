from domain.enums import RoleEnum
from infrastructure.websocket.dtos.base_websocket_message import BaseWebSocketMessage


class WebSocketGameRolePayload(BaseWebSocketMessage):
    text: str
    role: RoleEnum
