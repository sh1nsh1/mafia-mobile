from infrastructure.websocket.dtos.base_websocket_message import BaseWebSocketMessage


class WebSocketInfo(BaseWebSocketMessage):
    text: str
