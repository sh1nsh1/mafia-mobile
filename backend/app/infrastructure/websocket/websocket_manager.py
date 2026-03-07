import logging
from uuid import UUID

from fastapi import WebSocket

from infrastructure.websocket.dtos.websocket_messages import WebSocketMessage


class WebSocketManager:
    _instance = None

    def __new__(cls):
        if cls._instance is None:
            cls._instance = super().__new__(cls)
            cls._instance._init()
        return cls._instance

    def _init(self):
        # room_id = {lobby_id = game_id}
        # room_id : dict[user_id: WebSocket]
        self._active_connections: dict[str, dict[UUID, WebSocket]] = {}
        self.logger = logging.getLogger(self.__class__.__name__)

    async def get_websocket(self, context_id: str, user_id: UUID) -> WebSocket:
        self.logger.debug("get_websocket")
        return self._active_connections[context_id][user_id]

    async def connect(self, ws: WebSocket, context_id: str, user_id: UUID):
        self.logger.debug("connect")
        await ws.accept()
        if context_id not in self._active_connections:
            self._active_connections[context_id] = {}
        self._active_connections[context_id][user_id] = ws

    def disconnect(self, context_id: str, user_id: UUID):
        self.logger.debug("disconnect")
        del self._active_connections[context_id][user_id]
        if not self._active_connections[context_id]:
            del self._active_connections[context_id]

    async def send_to_one(
        self, context_id: str, user_id: UUID, message: WebSocketMessage
    ):
        self.logger.debug("send_to_one")
        ws = await self.get_websocket(context_id, user_id)
        await ws.send_json(message.to_dict())

    async def send_to_many(
        self, context_id: str, user_ids: list[UUID], message: WebSocketMessage
    ):
        self.logger.debug("send_to_many")
        for user_id in user_ids:
            await self.send_to_one(context_id, user_id, message)

    async def send_broadcast(self, context_id: str, message: WebSocketMessage):
        self.logger.debug("send_broadcast")
        all_users = [
            user_id
            for user_id, ws in self._active_connections[context_id].items()
        ]
        await self.send_to_many(context_id, all_users, message)
