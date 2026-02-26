import infrastructure.redis.dependencies as infra_dep
from fastapi import Depends
from infrastructure.redis.repositories.lobby_repository import LobbyRepository
from infrastructure.websocket.websocket_manager import (
    WebSocketManager,
)


def get_websocket_manager() -> WebSocketManager:
    return WebSocketManager()
