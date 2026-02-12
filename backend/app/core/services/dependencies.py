from fastapi import Depends, Request

import infrastructure.redis.dependencies as infra_dep
from infrastructure.redis.repositories.lobby_repository import LobbyRepository
from infrastructure.websocket.websocket_connection_manager import WebSocketManager


async def get_lobby_repository(redis=Depends(infra_dep.get_redis_client)):
    yield LobbyRepository(redis)


def get_websocket_manager() -> WebSocketManager:
    return WebSocketManager()
