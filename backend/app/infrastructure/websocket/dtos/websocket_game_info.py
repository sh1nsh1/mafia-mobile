from infrastructure.websocket.dtos.base_websocket_message import BaseWebSocketMessage


class WebSocketGameInfo(BaseWebSocketMessage):
    text: str
