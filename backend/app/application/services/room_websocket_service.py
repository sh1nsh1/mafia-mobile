from uuid import UUID
from typing import Annotated
from datetime import datetime

from fastapi import Depends, WebSocket

from domain.enums import WebSocketTopicEnum, WebSocketMessageTypeEnum
from infrastructure.dependencies.alias import WebSocketManagerDep
from infrastructure.websocket.websocket_manager import WebSocketManager
from infrastructure.websocket.dtos.websocket_messages import WebSocketMessage


class RoomWebSocketService:
    _websocket_manager: WebSocketManager

    def __init__(self, websocket_manager: WebSocketManagerDep):
        self._websocket_manager = websocket_manager

    async def subscribe_room_webscoket(
        self, room_id: str, user_id: UUID, websocket: WebSocket
    ):
        await self._websocket_manager.connect(websocket, room_id, user_id)
        message = WebSocketMessage.create(
            message_type=WebSocketMessageTypeEnum.EVENT,
            topic=WebSocketTopicEnum.LOBBY,
            timestamp=datetime.now().isoformat(),
            payload={
                "text": f"User {str(user_id)} подключился к лобби",
                "sender": str(user_id),
            },
            metadata=None,
        )
        await self._websocket_manager.send_broadcast(room_id, message)

    async def unsubscribe_room_webscoket(self, room_id: str, user_id: UUID):
        self._websocket_manager.disconnect(room_id, user_id)
        message = WebSocketMessage.create(
            message_type=WebSocketMessageTypeEnum.EVENT,
            topic=WebSocketTopicEnum.LOBBY,
            timestamp=datetime.now().isoformat(),
            payload={
                "text": f"User {user_id} покинул лобби",
                "sender": user_id,
            },
            metadata=None,
        )
        await self._websocket_manager.send_broadcast(room_id, message)

    async def handle_message(self, json_message: str, websocket: WebSocket):
        # TODO
        pass


RoomWebSocketServiceDep = Annotated[RoomWebSocketService, Depends()]
