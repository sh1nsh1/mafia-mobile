import logging
from typing import Annotated

from fastapi import Depends

from domain.enums import (
    WebSocketMessageTypeEnum,
    WebSocketLobbyCommandTypeEnum,
    WebSocketGameCommandActionTypeEnum,
)
from domain.exceptions import LobbyNotFoundException
from application.dependencies import GameManagerDep
from application.services.game_service import GameServiceDep
from application.services.lobby_service import LobbyServiceDep
from application.services.notification_service import NotificationSeviceDep
from infrastructure.websocket.dtos.websocket_message import WebSocketMessage
from infrastructure.websocket.dtos.websocket_lobby_command import WebSocketLobbyCommand


class LobbyWebSocketHandler:
    def __init__(
        self,
        game_service: GameServiceDep,
        lobby_service: LobbyServiceDep,
        game_manager: GameManagerDep,
        notification_service: NotificationSeviceDep,
    ):
        self._logger = logging.getLogger(self.__class__.__name__)
        self._game_service = game_service
        self._lobby_service = lobby_service
        self._notification_service = notification_service
        self._game_manager = game_manager

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
                    raise  # TODO Exeption

                lobby = await self._lobby_service._lobby_repository.get_lobby_by_id(
                    websocket_command.room_id
                )

                if not lobby:
                    exc = LobbyNotFoundException(websocket_command.room_id)
                    self._logger.error(exc)
                    raise exc

                self._logger.debug("calling create game")
                new_game = await self._game_service.create_game_from_lobby(
                    lobby, websocket_command.role_set
                )
                self._logger.debug("calling start game")
                await self._game_manager.start_game(new_game)
                # self._logger.debug("calling emit update signal")
                # await self._game_manager.emit_update_signal(new_game.id)
                self._logger.debug("handling finished")

                # await self._game_manager.set_event(
                #     websocket_command.room_id, websocket_command.action_type
                # )

            elif (
                websocket_command.action_type == WebSocketGameCommandActionTypeEnum.VOTE
            ):
                await self._game_service.process_vote(websocket_command)
                await self._game_manager.emit_update_signal(websocket_command.room_id)
                await self._game_manager.set_event(
                    websocket_command.room_id, websocket_command.action_type
                )

            elif (
                websocket_command.action_type
                == WebSocketGameCommandActionTypeEnum.END_TALK
            ):
                await self._game_manager.emit_update_signal(websocket_command.room_id)
                await self._game_manager.set_event(
                    websocket_command.room_id, websocket_command.action_type
                )

        elif message.message_type == WebSocketMessageTypeEnum.EVENT:
            # TODO notification_service
            pass


LobbyWebSocketHandlerDep = Annotated[LobbyWebSocketHandler, Depends()]
