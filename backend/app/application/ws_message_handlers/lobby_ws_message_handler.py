import logging
from typing import Annotated

from fastapi import Depends

from domain.enums import (
    WebSocketMessageTypeEnum,
    WebSocketLobbyCommandTypeEnum,
)
from domain.exceptions import AppException, LobbyNotFoundException
from application.dependencies import GameManagerDep
from application.services.game_service import GameServiceDep
from application.services.lobby_service import LobbyServiceDep
from application.commands.lobby_leave_command import LobbyLeaveCommand
from application.services.notification_service import NotificationSeviceDep
from infrastructure.websocket.websocket_manager import WebSocketManagerDep
from infrastructure.websocket.dtos.websocket_message import WebSocketMessage
from infrastructure.websocket.dtos.websocket_lobby_command import WebSocketLobbyCommand


class LobbyWebSockeMessagetHandler:
    def __init__(
        self,
        game_service: GameServiceDep,
        lobby_service: LobbyServiceDep,
        game_manager: GameManagerDep,
        notification_service: NotificationSeviceDep,
        websocket_manager: WebSocketManagerDep,
    ):
        self._logger = logging.getLogger(self.__class__.__name__)
        self._game_service = game_service
        self._lobby_service = lobby_service
        self._notification_service = notification_service
        self._game_manager = game_manager
        self._websocket_manager = websocket_manager

    async def handle(self, message: WebSocketMessage):
        self._logger.debug("handle")
        self._logger.debug(message.model_dump_json())
        """
        Обрабатывает Lobby Websocket Message взависимости от его типа
        """
        if message.message_type == WebSocketMessageTypeEnum.COMMAND:
            websocket_command = WebSocketLobbyCommand(**message.payload.model_dump())

            if websocket_command.action_type == WebSocketLobbyCommandTypeEnum.START:
                if not websocket_command.role_set:
                    exc = AppException("WebsSocketCommand missing role_set")
                    self._logger.error(exc)
                    raise exc

                lobby = await self._lobby_service._lobby_repository.get_lobby_by_id(
                    websocket_command.room_id
                )

                if not lobby:
                    exc = LobbyNotFoundException(context_id=websocket_command.room_id)
                    self._logger.error(exc)
                    raise exc

                self._logger.debug("calling create game")
                new_game = await self._game_service.create_game_from_lobby(
                    lobby, websocket_command.role_set
                )
                self._logger.debug("calling start game")
                await self._game_manager.start_game(new_game)

            elif websocket_command.action_type == WebSocketLobbyCommandTypeEnum.KICK:
                if not websocket_command.target_id:
                    exc = AppException("WebSocket KICK command missing target_id")
                    self._logger.error(exc)
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
                await self._websocket_manager.disconnect_all(
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


LobbyWebSocketHandlerDep = Annotated[LobbyWebSockeMessagetHandler, Depends()]
