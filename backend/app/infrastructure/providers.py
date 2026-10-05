from typing import AsyncGenerator
from contextlib import asynccontextmanager

from dishka import Scope, Provider, provide
from redis.asyncio import Redis
from botocore.client import BaseClient
from sqlalchemy.ext.asyncio import AsyncSession

from infrastructure.factories import (
    S3ClientFactory,
    DBSessionFactory,
    RedisClientFactory,
)
from infrastructure.websocket import WebSocketManager
from infrastructure.redis.repositories import GameRepository, LobbyRepository
from infrastructure.database.repositories import (
    UserRepository,
    AvatarRepository,
)
from infrastructure.s3.repositories.s3repository import S3Repository


class InfrastructureProvider(Provider):
    @provide(scope=Scope.APP)
    def websocket_manager(self) -> WebSocketManager:
        return WebSocketManager()


    # F A C T O R I E S
    @provide(scope=Scope.APP)
    def redis_factory(self) -> RedisClientFactory:
        return RedisClientFactory()

    @provide(scope=Scope.APP)
    def s3_factory(self) -> S3ClientFactory:
        return S3ClientFactory()

    @provide(scope=Scope.APP)
    def s3_client(self, s3_factory: S3ClientFactory) -> BaseClient:
        return s3_factory.create_client()

    @provide(scope=Scope.APP)
    def db_session_factory(self) -> DBSessionFactory:
        return DBSessionFactory()


    # S E S S I O N S
    @provide(scope=Scope.REQUEST)
    async def db_session(
        self,
        db_session_factory: DBSessionFactory,
    ) -> AsyncGenerator[AsyncSession, None]:
        session = await db_session_factory.get_session()
        try:
            yield session
        except Exception:
            await session.rollback()
            raise
        finally:
            await session.close()

    @provide(scope=Scope.REQUEST)
    async def redis_session(
        self,
        factory: RedisClientFactory
    ) -> AsyncGenerator[Redis, None]:
        async with factory.get_connection() as client:
            yield client


    # R E P O S I T O R I E S
    @provide(scope=Scope.REQUEST)
    def user_repository(
        self, session_factory: DBSessionFactory
    ) -> UserRepository:
        return UserRepository(session_factory)

    # @provide(scope=Scope.REQUEST)
    # def avatar_repository(
    #     self,
    #     session_factory: DBSessionFactory,
    #     s3_repo: S3Repository,
    # ) -> AvatarRepository:
    #     return AvatarRepository(session_factory, s3_repo)

    @provide(scope=Scope.REQUEST)
    def game_repository(
        self, redis: Redis, user_repo: UserRepository
    ) -> GameRepository:
        return GameRepository(redis, user_repo)

    @provide(scope=Scope.REQUEST)
    def lobby_repository(
        self, redis: Redis, user_repo: UserRepository
    ) -> LobbyRepository:
        return LobbyRepository(redis, user_repo)

    # @provide(scope=Scope.REQUEST)
    # def s3_repository(self, s3_client: BaseClient) -> S3Repository:
    #     return S3Repository(s3_client)
