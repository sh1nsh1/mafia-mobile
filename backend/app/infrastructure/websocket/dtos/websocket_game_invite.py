from infrastructure.websocket.dtos.base_websocket_message import BaseWebSocketMessage


class WebSocketGameInvite(BaseWebSocketMessage):
    text: str
    timeout: int
