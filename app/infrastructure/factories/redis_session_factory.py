from typing import AsyncGenerator
from contextlib import asynccontextmanager

from redis.asyncio import Redis, from_url

from infrastructure.logger import get_logger
from infrastructure.environment import env


logger = get_logger(f"{__name__}.RedisClientFactory", 20)


class RedisClientFactory:
    def __init__(
        self,
    ):
        self._client: Redis | None = None
        self._operation_count = 0

    async def create_client(self) -> Redis:

        if self._client is None:
            logger.info("Creating Redis client")
            self._client = from_url(
                env.redis.url,
                decode_responses=True,
                max_connections=10,
            )
            # Проверяем соединение
            await self._client.ping()
            logger.info("Redis client created successfully")
        return self._client

    async def close_client(self):
        if self._client:
            logger.info("Closing Redis client...")
            await self._client.close()
            self._client = None
            logger.info("Redis client closed")

    @asynccontextmanager
    async def get_connection(self) -> AsyncGenerator[Redis, None]:
        client = await self.create_client()
        self._operation_count += 1
        request_id = id(client)

        logger.debug(
            f"Getting Redis connection #{self._operation_count} "
            f"(client_id={request_id})"
        )

        try:
            yield client
            logger.debug(f"Redis connection #{self._operation_count} used successfully")
        except Exception as e:
            logger.error(f"Redis connection #{self._operation_count} failed: {e}")
            raise
        finally:
            logger.debug(f"Redis connection #{self._operation_count} released")
