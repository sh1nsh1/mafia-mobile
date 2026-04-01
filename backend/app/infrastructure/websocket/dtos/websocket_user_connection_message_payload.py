from uuid import UUID

from presentation.api.v1.dtos.responses.user_response import UserResponse
from infrastructure.websocket.dtos.base_websocket_message import BaseWebSocketMessage


class WebSocketUserConnectionMessagePayload(BaseWebSocketMessage):
    text: str
    user: UserResponse
