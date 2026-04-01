import logging
from typing import Annotated
from datetime import datetime

from fastapi import Depends, WebSocket

from domain.enums import WebSocketTopicEnum, WebSocketMessageTypeEnum
from infrastructure.websocket.websocket_manager import WebSocketManagerDep
from presentation.api.v1.dtos.requests.current_user import CurrentUser
from infrastructure.websocket.dtos.websocket_message import WebSocketMessage
from presentation.api.v1.dtos.responses.user_response import UserResponse
from application.ws_message_handlers.game_ws_message_handler import (
    GameWebSocketMessageHandlerDep,
)
from application.ws_message_handlers.lobby_ws_message_handler import (
    LobbyWebSockeMessageHandlerDep,
)
from infrastructure.websocket.dtos.websocket_game_info_payload import (
    WebSocketGameInfoPayload,
)
from infrastructure.websocket.dtos.websocket_user_connection_message_payload import (
    WebSocketUserConnectionMessagePayload,
)


class RoomWebSocketService:
    def __init__(
        self,
        websocket_manager: WebSocketManagerDep,
        game_websocket_handler: GameWebSocketMessageHandlerDep,
        lobby_websocket_handler: LobbyWebSockeMessageHandlerDep,
    ):
        self._websocket_manager = websocket_manager
        self._game_websocket_handler = game_websocket_handler
        self._lobby_websocket_handler = lobby_websocket_handler
        self._logger = logging.getLogger(self.__class__.__name__)

    async def subscribe_room_webscoket(
        self, room_id: str, current_user: CurrentUser, websocket: WebSocket
    ):
        self._logger.debug("subscribe_room_webscoket")
        await self._websocket_manager.connect(websocket, room_id, current_user.id)
        message = WebSocketMessage(
            message_type=WebSocketMessageTypeEnum.EVENT,
            topic=WebSocketTopicEnum.LOBBY,
            timestamp=datetime.now().isoformat(),
            payload=WebSocketUserConnectionMessagePayload(
                text=f"User {current_user.username} подключился к лобби",
                user=UserResponse(
                    id=current_user.id,
                    name=current_user.username,
                    email=current_user.email,
                ),
            ),
        )
        await self._websocket_manager.send_broadcast(room_id, message)

    async def unsubscribe_room_webscoket(self, room_id: str, current_user: CurrentUser):
        self._logger.debug("unsubscribe_room_webscoket")
        await self._websocket_manager.disconnect(room_id, current_user.id)
        message = WebSocketMessage(
            message_type=WebSocketMessageTypeEnum.EVENT,
            topic=WebSocketTopicEnum.LOBBY,
            timestamp=datetime.now().isoformat(),
            payload=WebSocketUserConnectionMessagePayload(
                text=f"User {current_user.username} покинул лобби",
                user=UserResponse(
                    id=current_user.id,
                    name=current_user.username,
                    email=current_user.email,
                ),
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
