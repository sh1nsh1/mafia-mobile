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

    async def notify_one(
        self,
        websocket_message: WebSocketMessage,
        game_id: str,
        player_user_id: UUID,
    ):
        await self._connection_manager.send_to_one(
            game_id, player_user_id, websocket_message
        )

    async def notify_many(
        self,
        websocket_message: WebSocketMessage,
        game_id: str,
        player_user_ids: list[UUID],
    ):
        await self._connection_manager.send_to_many(
            game_id, player_user_ids, websocket_message
        )

    async def notify_all(
        self,
        websocket_message: WebSocketMessage,
        game_id: str,
    ):
        await self._connection_manager.send_broadcast(game_id, websocket_message)


NotificationSeviceDep = Annotated[NotificationService, Depends()]
