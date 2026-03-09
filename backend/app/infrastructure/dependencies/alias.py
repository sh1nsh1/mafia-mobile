from typing import Annotated

from fastapi import Depends
from redis.asyncio import Redis
from sqlalchemy.ext.asyncio import AsyncSession

from infrastructure.dependencies.dependencies import (
    get_websocket_manager,
    get_db_session_factory,
)
from infrastructure.redis.redis_client_factory import RedisClientFactory
from infrastructure.database.db_session_factory import DBSessionFactory
from infrastructure.websocket.websocket_manager import WebSocketManager


RedisClientDep = Annotated[Redis, Depends(RedisClientFactory())]
WebSocketManagerDep = Annotated[WebSocketManager, Depends(get_websocket_manager)]
DBSessionFactoryDep = Annotated[DBSessionFactory, Depends(get_db_session_factory)]
