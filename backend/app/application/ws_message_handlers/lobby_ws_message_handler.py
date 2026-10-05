from typing import Annotated

from dishka import FromDishka
from fastapi import Depends

from domain.enums import (
    WebSocketTopicEnum,
    WebSocketMessageTypeEnum,
    WebSocketLobbyCommandTypeEnum,
)
from domain.exceptions import DomainException, RoomNotFoundException
from application.commands import LobbyLeaveCommand
from application.services import GameService, GameManagerService
from infrastructure.logger import get_logger
from infrastructure.websocket import WebSocketManager
from infrastructure.websocket.dtos import WebSocketMessage, WebSocketLobbyCommandPayload
from application.services.lobby_service import LobbyService


logger = get_logger(f"{__name__}.LobbyWebSockeMessageHandler", 10)

class LobbyWebSockeMessageHandler:

    def __init__(
        self,
        game_service: FromDishka[GameService],
        lobby_service: FromDishka[LobbyService],
        game_manager: FromDishka[GameManagerService],
        notification_service: FromDishka[WebSocketManager],
        websocket_manager: FromDishka[WebSocketManager],
    ):
        self._game_service = game_service
        self._lobby_service = lobby_service
        self._notification_service = notification_service
        self._game_manager = game_manager
        self._websocket_manager = websocket_manager

    async def handle(self, message: WebSocketMessage):
        logger.debug("handle")
        logger.debug(message.model_dump_json())
        """
        Обрабатывает Lobby Websocket Message взависимости от его типа
        """
        if message.message_type == WebSocketMessageTypeEnum.COMMAND:
            websocket_command = WebSocketLobbyCommandPayload(
                **message.payload.model_dump()
            )

            if websocket_command.action_type == WebSocketLobbyCommandTypeEnum.START:
                if not websocket_command.role_set:
                    exc = DomainException(
                        WebSocketTopicEnum.LOBBY, "WebsSocketCommand missing role_set"
                    )
                    logger.error(exc)
                    raise exc

                lobby = await self._lobby_service._lobby_repository.get_lobby_by_id(
                    websocket_command.room_id
                )

                if not lobby:
                    exc = RoomNotFoundException(context_id=websocket_command.room_id)
                    logger.error(exc)
                    raise exc

                logger.debug("calling create game")
                new_game = await self._game_service.create_game_from_lobby(
                    lobby, websocket_command.role_set
                )
                logger.debug("calling start game")
                await self._game_manager.start_game(new_game)

            elif websocket_command.action_type == WebSocketLobbyCommandTypeEnum.KICK:
                if not websocket_command.target_id:
                    exc = DomainException(
                        WebSocketTopicEnum.LOBBY,
                        "WebSocket KICK command missing target_id",
                    )
                    logger.error(exc)
                    raise exc
                lobby_leave_command = LobbyLeaveCommand(
                    lobby_id=websocket_command.room_id,
                    user_id=websocket_command.target_id,
                )
                await self._lobby_service.leave_lobby(lobby_leave_command)
                await self._websocket_manager.disconnect(
                    lobby_leave_command.lobby_id, lobby_leave_command.user_id
                )
            elif websocket_command.action_type == WebSocketLobbyCommandTypeEnum.DELETE:
                lobby_leave_command = LobbyLeaveCommand(
                    lobby_id=websocket_command.room_id,
                    user_id=websocket_command.actor_id,
                )
                await self._lobby_service.leave_lobby(lobby_leave_command)
                await self._websocket_manager.delete_all_connections(
                    lobby_leave_command.lobby_id
                )
            elif websocket_command.action_type == WebSocketLobbyCommandTypeEnum.LEAVE:
                lobby_leave_command = LobbyLeaveCommand(
                    lobby_id=websocket_command.room_id,
                    user_id=websocket_command.actor_id,
                )
                await self._lobby_service.leave_lobby(lobby_leave_command)
                await self._websocket_manager.disconnect(
                    lobby_leave_command.lobby_id, lobby_leave_command.user_id
                )
