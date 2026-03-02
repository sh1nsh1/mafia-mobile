import os
from typing import Annotated

import redis.asyncio as redis
from fastapi import Depends
from infrastructure.database.models.base_model import Base
from infrastructure.database.db_session_factory import DBSessionFactory


async def get_db_session_factory():
    env = dict(os.environ)
    db_url = (
        f"{env['POSTGRES_SERVER']}://{env['POSTGRES_USER']}:"
        f"{env['POSTGRES_PASSWORD']}"
        f"@{env['POSTGRES_HOST']}:"
        f"{env['POSTGRES_PORT']}/"
        f"{env['POSTGRES_DB']}"
    )
    db_url = env["DATABASE_URL"]
    print(db_url)
    return DBSessionFactory(db_url)


class RedisClientFactory:
    def __call__(self) -> redis.Redis:
        redis_url = dict(os.environ)["REDIS_URL"]
        self.client = redis.from_url(redis_url)
        return self.client


async def init_db(
    session_factory: Annotated[
        DBSessionFactory, Depends(get_db_session_factory)
    ],
):
    async with session_factory.engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)
