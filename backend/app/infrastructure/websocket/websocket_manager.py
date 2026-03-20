import logging
from uuid import UUID
from typing import Annotated
from functools import lru_cache

from fastapi import Depends, WebSocket

from domain.exceptions import AppException
from infrastructure.websocket.dtos.websocket_message import WebSocketMessage


class WebSocketManager:
    _instance = None
    _active_connections: dict[str, dict[UUID, WebSocket]]
    """room_id -> {user_id -> websocket}"""

    def __new__(cls):
        if cls._instance is None:
            cls._instance = super().__new__(cls)
            cls._instance._init()
        return cls._instance

    def _init(self):
        self._active_connections = {}
        self.logger = logging.getLogger(self.__class__.__name__)

    async def get_websocket(self, room_id: str, user_id: UUID) -> WebSocket:
        self.logger.debug("get_websocket")
        room_websockets = self._active_connections.get(room_id)
        if not room_websockets:
            raise AppException(f"Комната {room_id} не имеет подключений")
        websocket = room_websockets.get(user_id)
        if not websocket:
            raise AppException(f"Комната {room_id} не имеет подключения {str(user_id)}")
        return websocket

    async def connect(self, ws: WebSocket, room_id: str, user_id: UUID):
        self.logger.debug("connect")
        await ws.accept()
        if room_id not in self._active_connections:
            self._active_connections[room_id] = {}
        self._active_connections[room_id][user_id] = ws

    def disconnect(self, room_id: str, user_id: UUID):
        self.logger.debug("disconnect")
        del self._active_connections[room_id][user_id]
        if not self._active_connections[room_id]:
            del self._active_connections[room_id]

    async def send_to_one(self, room_id: str, user_id: UUID, message: WebSocketMessage):
        """
        Отправить message игроку user_id в комнате room_id
        """
        self.logger.debug("send_to_one")
        ws = await self.get_websocket(room_id, user_id)
        await ws.send_json(message.model_dump_json(by_alias=True))

    async def send_to_many(
        self, room_id: str, user_ids: list[UUID], message: WebSocketMessage
    ):
        self.logger.debug("send_to_many")
        for user_id in user_ids:
            await self.send_to_one(room_id, user_id, message)

    async def send_broadcast(self, room_id: str, message: WebSocketMessage):
        self.logger.debug("send_broadcast")
        all_users = [
            user_id for user_id, ws in self._active_connections[room_id].items()
        ]
        await self.send_to_many(room_id, all_users, message)


@lru_cache
def get_websocket_manager() -> WebSocketManager:
    return WebSocketManager()


WebSocketManagerDep = Annotated[WebSocketManager, Depends(get_websocket_manager)]
