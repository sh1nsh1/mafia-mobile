from datetime import datetime

from dishka import FromDishka

from domain.enums import (
    GameStageEnum,
    WebSocketTopicEnum,
    WebSocketMessageTypeEnum,
    WebSocketGameCommandActionTypeEnum,
)
from domain.exceptions import DomainException, PlayerDisabledException
from application.services import GameService, GameManagerService
from infrastructure.logger import get_logger
from infrastructure.websocket import WebSocketManager
from infrastructure.websocket.dtos import (
    WebSocketMessage,
    WebSocketGameInfoPayload,
    WebSocketGameCommandPayload,
)


logger = get_logger(f"{__name__}.GameWebSocketMessageHandler", 10)

class GameWebSocketMessageHandler:

    def __init__(
        self,
        game_service: FromDishka[GameService],
        game_manager: FromDishka[GameManagerService],
        websocket_manager: FromDishka[WebSocketManager],
    ):
        self._game_service = game_service
        self._game_manager = game_manager
        self._websocket_manager = websocket_manager

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
                        raise DomainException(
                            WebSocketTopicEnum.GAME, "Неожиданное сообщение"
                        )
                    result = await self._game_service.process_role_action(
                        websocket_command
                    )
                except DomainException as e:
                    logger.info(
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
                    logger.info("Сообщение об ошибке отправлено")
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
                        raise DomainException(
                            WebSocketTopicEnum.GAME, "Неожиданное сообщение"
                        )
                    await self._game_service.process_vote(websocket_command)
                    target_id = str(websocket_command.target_id)

                except DomainException as e:
                    logger.info(
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
                    logger.debug("Сообщение об ошибке отправлено")
                    if not isinstance(e, PlayerDisabledException):
                        logger.debug("wait for another vote")
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
