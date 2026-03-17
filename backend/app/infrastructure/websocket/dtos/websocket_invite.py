from infrastructure.websocket.dtos.base_websocket_message import BaseWebSocketMessage


class WebSocketInvite(BaseWebSocketMessage):
    text: str
    timeout: int
