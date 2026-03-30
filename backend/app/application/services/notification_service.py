import logging
from uuid import UUID
from typing import Annotated

from fastapi import Depends

from infrastructure.websocket.websocket_manager import WebSocketManagerDep
from infrastructure.websocket.dtos.websocket_message import WebSocketMessage


class Event:
    pass


class NotificationService:
    def __init__(self, connection_manager: WebSocketManagerDep) -> None:
        self._connection_manager = connection_manager
        self._logger = logging.getLogger(self.__class__.__name__)

    async def send_to_one(
        self,
        websocket_message: WebSocketMessage,
        game_id: str,
        player_user_id: UUID,
    ):
        self._logger.info(
            f"{game_id} @{str(player_user_id)}:    {websocket_message.model_dump()}"
        )
        await self._connection_manager.send_to_one(
            game_id, player_user_id, websocket_message
        )

    async def notify_many(
        self,
        websocket_message: WebSocketMessage,
        game_id: str,
        player_user_ids: list[UUID],
    ):
        self._logger.info(
            f"{game_id} @@[{', '.join([str(id) for id in player_user_ids])}]:    {websocket_message.model_dump()}"
        )
        await self._connection_manager.send_to_many(
            game_id, player_user_ids, websocket_message
        )

    async def send_broadcast(
        self,
        websocket_message: WebSocketMessage,
        game_id: str,
    ):
        self._logger.info(
            f"{game_id} @all:\n {
                '\n'.join(
                    [f'\t{k}:\t{v:}' for k, v in websocket_message.model_dump().items()]
                )
            }"
        )
        await self._connection_manager.send_broadcast(game_id, websocket_message)


NotificationSeviceDep = Annotated[NotificationService, Depends()]
