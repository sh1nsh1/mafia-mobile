from typing import Annotated

from fastapi import Depends
from redis.asyncio import Redis

from infrastructure.dependencies.dependencies import (
    RedisClientFactory,
    get_websocket_manager,
    get_db_session_factory,
)
from infrastructure.database.db_session_factory import DBSessionFactory
from infrastructure.websocket.websocket_manager import WebSocketManager
from infrastructure.redis.repositories.game_repository import GameRepository
from infrastructure.redis.repositories.lobby_repository import LobbyRepository
from infrastructure.database.repositories.user_repository import UserRepository


LobbyRepositoryDep = Annotated[LobbyRepository, Depends()]
GameRepositoryDep = Annotated[GameRepository, Depends()]
UserRepositoryDep = Annotated[UserRepository, Depends()]
DBSessionFactoryDep = Annotated[
    DBSessionFactory, Depends(get_db_session_factory)
]
RedisClientDep = Annotated[Redis, Depends(RedisClientFactory())]
WebSocketManagerDep = Annotated[
    WebSocketManager, Depends(get_websocket_manager)
]
