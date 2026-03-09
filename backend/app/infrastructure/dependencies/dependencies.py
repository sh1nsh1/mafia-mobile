import logging
from typing import Annotated
from functools import lru_cache

from fastapi import Depends
from sqlalchemy.engine import URL

from infrastructure.environment import env
from infrastructure.database.models.base_model import Base
from infrastructure.database.db_session_factory import DBSessionFactory
from infrastructure.websocket.websocket_manager import WebSocketManager


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


async def init_db(
    # session_factory: Annotated[DBSessionFactory, Depends(get_db_session_factory)],
):
    logger = logging.getLogger("init_db")
    logger.debug("init_db")
    session_factory = await anext(get_db_session_factory())
    async with session_factory.engine.begin() as conn:
        logger.debug("create_all")
        await conn.run_sync(Base.metadata.create_all)
        logger.debug("after create all")


@lru_cache
def get_websocket_manager() -> WebSocketManager:
    return WebSocketManager()
