import logging
from typing import Annotated

import boto3
from fastapi import Depends
from redis.asyncio import Redis
from botocore.client import BaseClient
from botocore.config import Config as BotocoreConfig
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
    maker_count: int = 0
    session_count: int = 0

    def __init__(self, database_url: URL):
        self._logger = logging.getLogger(self.__class__.__name__)
        self.engine = create_async_engine(database_url)
        self.session_maker = async_sessionmaker(self.engine)
        DBSessionFactory.maker_count += 1
        self._logger.debug(
            f"DBSessionFactory init - open({DBSessionFactory.maker_count}) sessions {DBSessionFactory.session_count}"
        )

    def __call__(self) -> AsyncSession:
        """Возращает новую сессию"""
        DBSessionFactory.session_count += 1
        self._logger.debug(
            f"new session open - opened {DBSessionFactory.session_count} engines {DBSessionFactory.maker_count}"
        )
        return self.session_maker()

    async def __aenter__(self):
        """Поддержка контекстного менеджера"""
        self._logger.debug("async with as session_maker")
        return self

    async def __aexit__(self, *args):
        self._logger.debug("dispose request")
        await self.dispose()

    async def dispose(self):
        await self.engine.dispose()
        DBSessionFactory.maker_count -= 1
        DBSessionFactory.session_count = 0
        self._logger.debug(f"engine disposed - open {DBSessionFactory.maker_count}")


class RedisClientFactory:
    def __call__(self) -> Redis:
        self.client = Redis.from_url(env.redis.url, decode_responses=True)
        return self.client


class S3ClientFactory:
    def __call__(self):
        config = BotocoreConfig(
            signature_version="s3v4",
            s3={"addressing_style": "path"},
            retries={"max_attempts": 3, "mode": "standard"},
            region_name="ru-1",  # Можно вынести в env если нужно
        )

        return boto3.client(
            "s3",
            endpoint_url=env.s3.address,  # берём address из env
            aws_access_key_id=env.s3.access_key,
            aws_secret_access_key=env.s3.secret_key,
            config=config,
        )


S3ClientFactoryDep = Annotated[BaseClient, Depends(S3ClientFactory())]

RedisClientDep = Annotated[Redis, Depends(RedisClientFactory())]

DBSessionFactoryDep = Annotated[
    DBSessionFactory, Depends(get_db_session_factory, scope="function")
]
