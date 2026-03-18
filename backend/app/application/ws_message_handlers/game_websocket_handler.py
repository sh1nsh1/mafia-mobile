from typing import Annotated

from fastapi import Depends

from domain.enums import WebSocketMessageTypeEnum, WebSocketGameCommandActionTypeEnum
from application.dependencies import GameManagerDep
from application.services.game_service import GameServiceDep
from application.services.notification_service import NotificationSeviceDep
from infrastructure.websocket.dtos.websocket_message import WebSocketMessage
from infrastructure.websocket.dtos.websocket_game_command import WebSocketGameCommand


class GameWebSocketHandler:
    def __init__(
        self,
        game_service: GameServiceDep,
        game_manager: GameManagerDep,
        notification_service: NotificationSeviceDep,
    ):
        self._game_service = game_service
        self._notification_service = notification_service
        self._game_manager = game_manager

    async def handle(self, message: WebSocketMessage):
        """
        Обрабатывает Websocket Message взависимости от его типа
        """
        if message.message_type == WebSocketMessageTypeEnum.COMMAND:
            websocket_command = WebSocketGameCommand(**message.payload)

            if (
                websocket_command.action_type
                == WebSocketGameCommandActionTypeEnum.ROLE_ACTION
            ):
                await self._game_service.process_role_action(websocket_command)
                await self._game_manager.emit_update_signal(websocket_command.room_id)
                await self._game_manager.set_event(
                    websocket_command.room_id, websocket_command.action_type
                )

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


GameWebSocketHandlerDep = Annotated[GameWebSocketHandler, Depends()]
