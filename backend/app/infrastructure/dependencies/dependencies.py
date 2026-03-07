from functools import lru_cache

import redis.asyncio as redis
from sqlalchemy.engine import URL

from infrastructure.environment import env
from infrastructure.dependencies.alias import DBSessionFactoryDep
from infrastructure.database.models.base_model import Base
from infrastructure.database.db_session_factory import DBSessionFactory
from infrastructure.websocket.websocket_manager import WebSocketManager


async def get_db_session_factory():
    pg = env.postgres

    db_url: URL = URL.create(
        drivername=pg.drivername,
        username=pg.user,
        password=pg.password,
        host=pg.host,
        port=pg.port,
        database=pg.db,
    )

    return DBSessionFactory(db_url)


class RedisClientFactory:
    def __call__(self) -> redis.Redis:
        self.client = redis.from_url(env.redis.url)
        return self.client


async def init_db(session_factory: DBSessionFactoryDep):
    async with session_factory.engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)


@lru_cache
def get_websocket_manager() -> WebSocketManager:
    return WebSocketManager()
