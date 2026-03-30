from infrastructure.websocket.dtos.base_websocket_message import BaseWebSocketMessage


class WebSocketGameInfoPayload(BaseWebSocketMessage):
    text: str
