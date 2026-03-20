import logging

from infrastructure.factories import get_db_session_factory
from application.services.game_service import GameService
from infrastructure.database.models.base_model import Base


async def init_db():
    logger = logging.getLogger("init_db")
    logger.debug("init_db")
    session_factory = await anext(get_db_session_factory())

    try:
        async with session_factory.engine.begin() as conn:
            logger.debug("create_all")
            await conn.run_sync(Base.metadata.create_all)
            logger.debug("after create all")
    except TimeoutError:
        logger.error("DB timeout - проверь PostgreSQL!")
        raise
    except Exception as e:
        logger.error(f"DB init error: {e}")
        raise
