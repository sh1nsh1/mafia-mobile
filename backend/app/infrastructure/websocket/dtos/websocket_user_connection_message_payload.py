from presentation.api.v1.dtos.responses.user_response import UserResponse
from infrastructure.websocket.dtos.base_websocket_message import BaseWebSocketMessage
from presentation.api.v1.dtos.responses.lobby_response_model import LobbyResponse


class WebSocketUserConnectionMessagePayload(BaseWebSocketMessage):
    text: str
    user: UserResponse
    lobby: LobbyResponse | None
