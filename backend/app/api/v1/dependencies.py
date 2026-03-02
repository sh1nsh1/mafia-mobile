from typing import Annotated
from functools import lru_cache

from fastapi import Depends
from fastapi import WebSocket
from fastapi.security import HTTPBearer
from fastapi.security import HTTPAuthorizationCredentials
from application.services.security_service import SecurityAService
from infrastructure.websocket.websocket_manager import WebSocketManager


@lru_cache
def get_websocket_manager() -> WebSocketManager:
    return WebSocketManager()


async def get_current_user(
    bearer_scheme: Annotated[HTTPAuthorizationCredentials, Depends(HTTPBearer())],
    security_service: Annotated[SecurityAService, Depends()],
):
    return await security_service.get_current_user(bearer_scheme.credentials)


async def get_current_user_ws(
    websocket: WebSocket,
    security_service: Annotated[SecurityAService, Depends()],
):
    auth_type, access_token = websocket.headers["Authorization"].split()
    if auth_type != "Bearer":
        raise ValueError()
    print(auth_type, access_token)
    return await security_service.get_current_user(access_token)
