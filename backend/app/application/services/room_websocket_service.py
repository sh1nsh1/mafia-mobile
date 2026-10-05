from datetime import datetime

from dishka import FromDishka
from fastapi import WebSocket

from domain.enums import WebSocketTopicEnum, WebSocketMessageTypeEnum
from application.services import UserService
from infrastructure.logger import get_logger
from infrastructure.websocket import WebSocketManager
from infrastructure.websocket.dtos import (
    WebSocketMessage,
    WebSocketUserConnectionMessagePayload,
)
from application.ws_message_handlers import (
    GameWebSocketMessageHandler,
    LobbyWebSockeMessageHandler,
)
from presentation.api.v1.dtos.requests import CurrentUser
from presentation.api.v1.dtos.responses import UserResponse, LobbyResponse


logger = get_logger(f"{__name__}.RoomWebSocketService", 10)

class RoomWebSocketService:

    def __init__(
        self,
        websocket_manager: FromDishka[WebSocketManager],
        game_websocket_handler: FromDishka[GameWebSocketMessageHandler],
        lobby_websocket_handler: FromDishka[LobbyWebSockeMessageHandler],
        user_service: FromDishka[UserService],
    ):
        self._websocket_manager = websocket_manager
        self._game_websocket_handler = game_websocket_handler
        self._lobby_websocket_handler = lobby_websocket_handler
        self._user_service = user_service

    async def subscribe_room_webscoket(
        self, room_id: str, current_user: CurrentUser, websocket: WebSocket
    ):
        logger.debug("subscribe_room_webscoket")
        await self._websocket_manager.connect(websocket, room_id, current_user.id)
        lobby = await self._lobby_websocket_handler._lobby_service._lobby_repository.get_lobby_by_id(
            room_id
        )

        message = WebSocketMessage(
            message_type=WebSocketMessageTypeEnum.USER_CONNECT,
            topic=WebSocketTopicEnum.LOBBY if lobby else WebSocketTopicEnum.GAME,
            timestamp=datetime.now().isoformat(),
            payload=WebSocketUserConnectionMessagePayload(
                text=f"User {current_user.username} подключился к комнате",
                user=UserResponse(
                    id=current_user.id,
                    name=current_user.username,
                    email=current_user.email,
                ),
                lobby=(
                    LobbyResponse(
                        status="OK",
                        admin_id=lobby.admin.id,
                        id=lobby.id,
                        max_players=lobby.max_players,
                        participants=[
                            UserResponse(
                                id=user.id, email=user.email, name=user.username
                            )
                            for user in lobby.participants
                        ],
                    )
                    if lobby
                    else None
                ),
            ),
        )
        await self._websocket_manager.send_broadcast(message, room_id)

    async def unsubscribe_room_webscoket(self, room_id: str, current_user: CurrentUser):
        logger.debug("unsubscribe_room_webscoket")
        await self._websocket_manager.handle_disconnect(room_id, current_user.id)

        user_joined_room = await self._user_service.get_user_joined_room(
            current_user.id
        )
        if not user_joined_room:
            logger.error("Can't unsubscribe non-existing room")
            return

        message = WebSocketMessage(
            message_type=WebSocketMessageTypeEnum.USER_LEAVE,
            topic=(
                WebSocketTopicEnum.LOBBY
                if user_joined_room.is_lobby
                else WebSocketTopicEnum.GAME
            ),
            timestamp=datetime.now().isoformat(),
            payload=WebSocketUserConnectionMessagePayload(
                text=f"User {current_user.username} покинул комнату",
                user=UserResponse(
                    id=current_user.id,
                    name=current_user.username,
                    email=current_user.email,
                ),
                lobby=None,
            ),
        )
        await self._websocket_manager.send_broadcast(message, room_id)

    async def handle_message(self, message: WebSocketMessage):
        logger.debug("handle_message")
        match message.topic:
            case WebSocketTopicEnum.LOBBY:
                await self._lobby_websocket_handler.handle(message)

            case WebSocketTopicEnum.GAME:
                await self._game_websocket_handler.handle(message)

            case WebSocketTopicEnum.SYSTEM:
                pass
                # TODO
