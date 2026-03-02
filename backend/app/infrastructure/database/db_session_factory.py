from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.ext.asyncio import async_sessionmaker
from sqlalchemy.ext.asyncio import create_async_engine


class DBSessionFactory:
    def __init__(self, database_url: str):
        self.engine = create_async_engine(database_url, echo=True)
        self.session_maker = async_sessionmaker(
            self.engine, expire_on_commit=False
        )

    def __call__(self) -> AsyncSession:
        """Позволяет использовать экземпляр как фабрику"""
        return self.session_maker()

    async def __aenter__(self) -> AsyncSession:
        """Поддержка контекстного менеджера"""
        self.session = self.session_maker()
        return self.session

    async def __aexit__(self, *args):
        await self.session.close()
