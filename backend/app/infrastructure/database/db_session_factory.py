import logging

from sqlalchemy.engine import URL
from sqlalchemy.ext.asyncio import (
    AsyncSession,
    async_sessionmaker,
    create_async_engine,
)


class DBSessionFactory:
    def __init__(self, database_url: URL):
        self._logger = logging.getLogger(self.__class__.__name__)
        self._logger.debug("DBSessionFactory instaciated")
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
