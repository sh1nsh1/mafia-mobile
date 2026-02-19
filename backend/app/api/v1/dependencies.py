from typing import Annotated

from fastapi import Depends
from core.services.room_websocket_service import RoomWebSocketAService
from infrastructure.websocket.websocket_connection_manager import (
    WebSocketManager,
)


async def get_room_websocket_aservice(
    websocket_manager: Annotated[WebSocketManager, Depends()],
):
    yield RoomWebSocketAService(websocket_manager)
