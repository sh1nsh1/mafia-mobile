from typing import Annotated
from functools import lru_cache

from fastapi import Depends
from fastapi.security import HTTPBearer
from fastapi.security import HTTPAuthorizationCredentials
from application.services.security_service import SecurityAService
from infrastructure.websocket.websocket_manager import WebSocketManager
from application.services.room_websocket_service import RoomWebSocketAService


@lru_cache
def get_websocket_manager() -> WebSocketManager:
    return WebSocketManager()


async def get_current_user(
    bearer_scheme: Annotated[
        HTTPAuthorizationCredentials, Depends(HTTPBearer())
    ],
    security_service: Annotated[SecurityAService, Depends()],
):
    return await security_service.get_current_user(bearer_scheme.credentials)
