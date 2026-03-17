from uuid import UUID
from typing import Annotated
from datetime import datetime

from fastapi import Depends, WebSocket

from domain.enums import WebSocketTopicEnum, WebSocketMessageTypeEnum
from infrastructure.websocket.websocket_manager import WebSocketManagerDep
from infrastructure.websocket.dtos.websocket_info import WebSocketInfo
from infrastructure.websocket.dtos.websocket_message import WebSocketMessage
from application.ws_message_handlers.game_websocket_handler import (
    GameWebSocketHandlerDep,
)


class RoomWebSocketService:
    def __init__(
        self,
        websocket_manager: WebSocketManagerDep,
        game_websocket_handler: GameWebSocketHandlerDep,
    ):
        self._websocket_manager = websocket_manager
        self._game_websocket_handler = game_websocket_handler

    async def subscribe_room_webscoket(
        self, room_id: str, user_id: UUID, websocket: WebSocket
    ):
        await self._websocket_manager.connect(websocket, room_id, user_id)
        message = WebSocketMessage(
            message_type=WebSocketMessageTypeEnum.EVENT,
            topic=WebSocketTopicEnum.LOBBY,
            timestamp=datetime.now().isoformat(),
            payload=WebSocketInfo(
                text=f"User {str(user_id)} подключился к лобби",
            ),
        )
        await self._websocket_manager.send_broadcast(room_id, message)

    async def unsubscribe_room_webscoket(self, room_id: str, user_id: UUID):
        self._websocket_manager.disconnect(room_id, user_id)
        message = WebSocketMessage(
            message_type=WebSocketMessageTypeEnum.EVENT,
            topic=WebSocketTopicEnum.LOBBY,
            timestamp=datetime.now().isoformat(),
            payload=WebSocketInfo(
                text=f"User {str(user_id)} покинул лобби",
            ),
        )
        await self._websocket_manager.send_broadcast(room_id, message)

    async def handle_message(self, message: WebSocketMessage):
        match message.topic:
            case WebSocketTopicEnum.LOBBY:
                pass

            case WebSocketTopicEnum.GAME:
                await self._game_websocket_handler.handle(message)

            case WebSocketTopicEnum.SYSTEM:
                pass
                # TODO


RoomWebSocketServiceDep = Annotated[RoomWebSocketService, Depends()]
