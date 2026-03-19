from infrastructure.websocket.dtos.base_websocket_message import BaseWebSocketMessage


class WebSocketGameActionRequest(BaseWebSocketMessage):
    text: str
    timeout: int
