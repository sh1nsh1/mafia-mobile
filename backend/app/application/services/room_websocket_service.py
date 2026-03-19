import logging
from uuid import UUID
from typing import Annotated
from datetime import datetime

from fastapi import Depends, WebSocket

from domain.enums import WebSocketTopicEnum, WebSocketMessageTypeEnum
from infrastructure.websocket.websocket_manager import WebSocketManagerDep
from infrastructure.websocket.dtos.websocket_message import WebSocketMessage
from infrastructure.websocket.dtos.websocket_game_info import WebSocketGameInfo
from application.ws_message_handlers.game_websocket_handler import (
    GameWebSocketHandlerDep,
)
from application.ws_message_handlers.lobby_websocket_handler import (
    LobbyWebSocketHandlerDep,
)


class RoomWebSocketService:
    def __init__(
        self,
        websocket_manager: WebSocketManagerDep,
        game_websocket_handler: GameWebSocketHandlerDep,
        lobby_websocket_handler: LobbyWebSocketHandlerDep,
    ):
        self._websocket_manager = websocket_manager
        self._game_websocket_handler = game_websocket_handler
        self._lobby_websocket_handler = lobby_websocket_handler
        self._logger = logging.getLogger(self.__class__.__name__)

    async def subscribe_room_webscoket(
        self, room_id: str, user_id: UUID, websocket: WebSocket
    ):
        self._logger.debug("subscribe_room_webscoket")
        await self._websocket_manager.connect(websocket, room_id, user_id)
        message = WebSocketMessage(
            message_type=WebSocketMessageTypeEnum.EVENT,
            topic=WebSocketTopicEnum.LOBBY,
            timestamp=datetime.now().isoformat(),
            payload=WebSocketGameInfo(
                text=f"User {str(user_id)} подключился к лобби",
            ),
        )
        await self._websocket_manager.send_broadcast(room_id, message)

    async def unsubscribe_room_webscoket(self, room_id: str, user_id: UUID):
        self._logger.debug("unsubscribe_room_webscoket")
        self._websocket_manager.disconnect(room_id, user_id)
        message = WebSocketMessage(
            message_type=WebSocketMessageTypeEnum.EVENT,
            topic=WebSocketTopicEnum.LOBBY,
            timestamp=datetime.now().isoformat(),
            payload=WebSocketGameInfo(
                text=f"User {str(user_id)} покинул лобби",
            ),
        )
        await self._websocket_manager.send_broadcast(room_id, message)

    async def handle_message(self, message: WebSocketMessage):
        self._logger.debug("handle_message")
        match message.topic:
            case WebSocketTopicEnum.LOBBY:
                await self._lobby_websocket_handler.handle(message)

            case WebSocketTopicEnum.GAME:
                await self._game_websocket_handler.handle(message)

            case WebSocketTopicEnum.SYSTEM:
                pass
                # TODO


RoomWebSocketServiceDep = Annotated[RoomWebSocketService, Depends()]
