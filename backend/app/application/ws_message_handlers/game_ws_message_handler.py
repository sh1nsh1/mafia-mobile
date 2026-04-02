import logging
from typing import Annotated
from datetime import datetime

from fastapi import Depends

from domain.enums import (
    GameStageEnum,
    WebSocketTopicEnum,
    WebSocketMessageTypeEnum,
    WebSocketGameCommandActionTypeEnum,
)
from domain.exceptions import (
    DomainException,
    PlayerDisabledException,
)
from application.dependencies import GameManagerDep
from application.services.game_service import GameServiceDep
from infrastructure.websocket.websocket_manager import WebSocketManagerDep
from infrastructure.websocket.dtos.websocket_message import WebSocketMessage
from infrastructure.websocket.dtos.websocket_game_info_payload import (
    WebSocketGameInfoPayload,
)
from infrastructure.websocket.dtos.websocket_game_command_payload import (
    WebSocketGameCommandPayload,
)


class GameWebSocketMessageHandler:
    def __init__(
        self,
        game_service: GameServiceDep,
        game_manager: GameManagerDep,
        websocket_manager: WebSocketManagerDep,
    ):
        self._game_service = game_service
        self._game_manager = game_manager
        self._websocket_manager = websocket_manager

        self._logger = logging.getLogger(self.__class__.__name__)

    async def handle(self, message: WebSocketMessage):
        """
        Обрабатывает Websocket Message взависимости от его типа
        """
        if message.message_type == WebSocketMessageTypeEnum.COMMAND:
            websocket_command = WebSocketGameCommandPayload(
                **message.payload.model_dump()
            )
            game = await self._game_service.get_game_by_id(websocket_command.room_id)
            if (
                websocket_command.action_type
                == WebSocketGameCommandActionTypeEnum.ROLE_ACTION
            ):
                try:
                    if game.game_stage != GameStageEnum.NIGHT:
                        raise DomainException("Game", "Неожиданное сообщение")
                    result = await self._game_service.process_role_action(
                        websocket_command
                    )
                except DomainException as e:
                    self._logger.info(
                        f"Domain Exception from user {websocket_command.actor_id} in room {websocket_command.room_id}: {e.args}"
                    )
                    await self._websocket_manager.send_to_one(
                        WebSocketMessage(
                            message_type=WebSocketMessageTypeEnum.ERROR,
                            topic=WebSocketTopicEnum(e.topic),
                            timestamp=datetime.now().isoformat(),
                            payload=WebSocketGameInfoPayload(
                                text=e.message or "Неизвестная ошибка"
                            ),
                        ),
                        websocket_command.room_id,
                        websocket_command.actor_id,
                    )
                    self._logger.info("Сообщение об ошибке отправлено")
                    result = None

                await self._game_manager.set_event(
                    websocket_command.room_id,
                    f"{websocket_command.action_type}|{result if isinstance(result, bool) else ''}",
                )

            elif (
                websocket_command.action_type == WebSocketGameCommandActionTypeEnum.VOTE
            ):
                try:
                    if game.game_stage != GameStageEnum.DAY_VOTE:
                        raise DomainException("Game", "Неожиданное сообщение")
                    await self._game_service.process_vote(websocket_command)
                    target_id = str(websocket_command.target_id)

                except DomainException as e:
                    self._logger.info(
                        f"Domain Exception from user {websocket_command.actor_id} in room {websocket_command.room_id}: {e.args}"
                    )
                    await self._websocket_manager.send_to_one(
                        WebSocketMessage(
                            message_type=WebSocketMessageTypeEnum.ERROR,
                            topic=WebSocketTopicEnum(e.topic),
                            timestamp=datetime.now().isoformat(),
                            payload=WebSocketGameInfoPayload(
                                text=e.message or "Неизвестная ошибка"
                            ),
                        ),
                        websocket_command.room_id,
                        websocket_command.actor_id,
                    )
                    self._logger.debug("Сообщение об ошибке отправлено")
                    if not isinstance(e, PlayerDisabledException):
                        self._logger.debug("wait for another vote")
                        return
                    target_id = ""

                await self._game_manager.set_event(
                    websocket_command.room_id,
                    f"{websocket_command.action_type}|{target_id}",
                )
                return

            elif (
                websocket_command.action_type
                == WebSocketGameCommandActionTypeEnum.END_TALK
            ):
                if game.game_stage in (GameStageEnum.DAY_TALK, GameStageEnum.DAY_INTRO):
                    await self._game_manager.set_event(
                        websocket_command.room_id, websocket_command.action_type
                    )

            elif (
                websocket_command.action_type
                == WebSocketGameCommandActionTypeEnum.LEAVE
            ):
                await self._game_manager.set_event(
                    websocket_command.room_id,
                    f"{websocket_command.action_type}|{str(websocket_command.actor_id)}",
                )
                await self._websocket_manager.disconnect(
                    websocket_command.room_id, websocket_command.actor_id
                )


GameWebSocketMessageHandlerDep = Annotated[GameWebSocketMessageHandler, Depends()]
