import logging
from typing import Annotated

from fastapi import Depends
from redis.asyncio import Redis
from sqlalchemy.engine import URL
from sqlalchemy.ext.asyncio import (
    AsyncSession,
    async_sessionmaker,
    create_async_engine,
)

from infrastructure.environment import env


async def get_db_session_factory():
    logger = logging.getLogger("get_db_session_factory")
    logger.debug("get_db_session_factory()")
    pg = env.postgres
    db_url: URL = URL.create(
        drivername=pg.drivername,
        username=pg.user,
        password=pg.password,
        host=pg.host,
        port=pg.port,
        database=pg.db,
    )
    async with DBSessionFactory(db_url) as session_factory:
        yield session_factory


class DBSessionFactory:
    def __init__(self, database_url: URL):
        self._logger = logging.getLogger(self.__class__.__name__)
        self._logger.debug("DBSessionFactory init")
        self.engine = create_async_engine(database_url)
        self.session_maker = async_sessionmaker(self.engine)

    def __call__(self) -> AsyncSession:
        """Возращает новую сессию"""
        self._logger.debug("_call_ new session created")
        return self.session_maker()

    async def __aenter__(self):
        """Поддержка контекстного менеджера"""
        self._logger.debug("async with as session_maker")
        return self

    async def __aexit__(self, *args):
        self._logger.debug("dispose request")
        await self.dispose()

    async def dispose(self):
        self._logger.debug("engine disposed")
        await self.engine.dispose()


class RedisClientFactory:
    def __call__(self) -> Redis:
        self.client = Redis.from_url(env.redis.url, decode_responses=True)
        return self.client


RedisClientDep = Annotated[Redis, Depends(RedisClientFactory())]

DBSessionFactoryDep = Annotated[DBSessionFactory, Depends(get_db_session_factory)]
