from infrastructure.websocket.dtos.base_websocket_message import BaseWebSocketMessage


class WebSocketGameActionRequestPayload(BaseWebSocketMessage):
    text: str
    timeout: int
