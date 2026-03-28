import asyncio
import logging
from uuid import UUID
from typing import Annotated
from functools import lru_cache

from fastapi import Depends, WebSocket

from domain.exceptions import AppException, DomainException
from infrastructure.websocket.room_connection import RoomConnection
from infrastructure.websocket.dtos.websocket_message import WebSocketMessage


class WebSocketManager:
    _instance = None

    active_connections: dict[str, dict[UUID, RoomConnection]]
    """room_id -> {user_id -> websocket}"""

    def __new__(cls):
        if cls._instance is None:
            cls._instance = super().__new__(cls)
            cls._instance._init()
        return cls._instance

    def _init(self):
        self._active_connections = {}
        self.active_connections = {}
        self.connection_archive = {}
        self._logger = logging.getLogger(self.__class__.__name__)

    async def get_room_connection(
        self, room_id: str, user_id: UUID
    ) -> RoomConnection | None:
        self._logger.debug("get_room_connection")
        room_connections = self.active_connections.get(room_id)
        if not room_connections:
            return None
        connection = room_connections.get(user_id)
        return connection

    async def connect(self, ws: WebSocket, room_id: str, user_id: UUID):
        self._logger.debug("connect")

        await ws.accept()

        connection = await self.get_room_connection(room_id, user_id)
        # повторное подключение
        if connection:
            connection.websocket = ws
            connection.is_ready = True
            while not connection.message_queue.empty():
                self._logger.debug(f"dequeue {WebSocketMessage.model_dump}")
                self._logger.debug(connection.message_queue)
                message: WebSocketMessage = await connection.message_queue.get()
                await self.send_to_one(room_id, user_id, message)
                await asyncio.sleep(1.5)
                connection.message_queue.task_done()
                self._logger.debug(connection.message_queue)

        # если первое подключение
        else:
            connection = RoomConnection(ws, asyncio.Queue())
            # если подключие админа
            if room_id not in self.active_connections:
                self.active_connections[room_id] = {}

            self.active_connections[room_id][user_id] = connection

    async def disconnect(self, room_id: str, user_id: UUID):
        self._logger.debug("disconnect")
        connection = await self.get_room_connection(room_id, user_id)
        if not connection:
            exc = AppException("Подключения не существует")
            self._logger.error(exc)
            raise exc

        # await connection.websocket.close()
        connection.is_ready = False

    def disconnect_all(self, room_id: str):
        self._logger.debug("disconnect_all")
        del self._active_connections[room_id]

    async def delete_all_connections(self, room_id: str):
        self._logger.debug("disconnect_all")
        room_connections = self.active_connections[room_id]

        for connection in room_connections.values():
            await connection.websocket.close(reason="Комната удалена владельцем лобби")

        del self.active_connections[room_id]

    async def send_to_one(self, room_id: str, user_id: UUID, message: WebSocketMessage):
        """
        Отправить message игроку user_id в комнате room_id
        """
        self._logger.debug("send_to_one")

        connection = await self.get_room_connection(room_id, user_id)
        if not connection:
            exc = AppException("Подключения не существует")
            self._logger.error(exc)
            raise exc

        if not connection.is_ready:
            self._logger.debug("enqueue")
            await connection.message_queue.put(message)
        else:
            self._logger.debug("send")
            await connection.websocket.send_json(message.model_dump_json(by_alias=True))

    async def send_to_many(
        self, room_id: str, user_ids: list[UUID], message: WebSocketMessage
    ):
        self._logger.debug("send_to_many")
        for user_id in user_ids:
            await self.send_to_one(room_id, user_id, message)

    async def send_broadcast(self, room_id: str, message: WebSocketMessage):
        self._logger.debug("send_broadcast")
        all_users = [user_id for user_id in self.active_connections[room_id].keys()]
        self._logger.debug(all_users)
        await self.send_to_many(room_id, all_users, message)


@lru_cache
def get_websocket_manager(request: WebSocket) -> WebSocketManager:

    if not hasattr(request.app.state, "websocket_manager"):
        websocket_manager = WebSocketManager()
        request.app.state.websocket_manager = websocket_manager
    return request.app.state.websocket_manager


WebSocketManagerDep = Annotated[WebSocketManager, Depends(get_websocket_manager)]
