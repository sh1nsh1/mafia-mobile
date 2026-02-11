from datetime import datetime

from fastapi import WebSocket

from domain.enums import WebSocketMessageTypeEnum, WebSocketTopicEnum
from infrastructure.websocket.dtos.websocket_messages import WebSocketMessage
from infrastructure.websocket.websocket_connection_manager import WebSocketManager


class LobbyWebSocketAService:
    _websocket_manager: WebSocketManager

    def __init__(self, websocket_manager: WebSocketManager):
        self._websocket_manager = websocket_manager

    async def subscribe_lobby_webscoket(self, lobby_id: str, user_id: str, websocket: WebSocket):
        await self._websocket_manager.connect(websocket, lobby_id, user_id)
        message = WebSocketMessage.create(
            message_type=WebSocketMessageTypeEnum.EVENT,
            topic=WebSocketTopicEnum.LOBBY,
            timestamp=datetime.now().isoformat(),
            payload={"text": f"User {user_id} подключился к лобби", "sender": user_id},
            metadata=None,
        )
        await self._websocket_manager.send_broadcast(lobby_id, message)

    async def unsubscribe_lobby_webscoket(self, lobby_id: str, user_id: str):
        self._websocket_manager.disconnect(lobby_id, user_id)
        message = WebSocketMessage.create(
            message_type=WebSocketMessageTypeEnum.EVENT,
            topic=WebSocketTopicEnum.LOBBY,
            timestamp=datetime.now().isoformat(),
            payload={"text": f"User {user_id} покинул лобби", "sender": user_id},
            metadata=None,
        )
        await self._websocket_manager.send_broadcast(lobby_id, message)

    async def handle_message(self, json_message: str, websocket: WebSocket):
        # TODO
        pass
