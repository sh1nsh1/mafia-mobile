import os
from typing import Annotated

import redis.asyncio as redis
from fastapi import Depends
from sqlalchemy.engine import URL
from infrastructure.database.models.base_model import Base
from infrastructure.database.db_session_factory import DBSessionFactory

from .environment import env


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
        redis_url = dict(os.environ)["REDIS_URL"]
        self.client = redis.from_url(redis_url)
        return self.client


async def init_db(
    session_factory: Annotated[DBSessionFactory, Depends(get_db_session_factory)],
):
    async with session_factory.engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)
