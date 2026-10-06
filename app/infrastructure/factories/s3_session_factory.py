from typing import AsyncGenerator
from contextlib import asynccontextmanager

from boto3.session import boto3
from botocore.client import BaseClient
from botocore.config import Config as BotocoreConfig

from infrastructure.logger import get_logger
from infrastructure.environment import env


logger = get_logger(f"{__name__}.S3ClientFactory", 20)


class S3ClientFactory:
    def __init__(self):
        self._client: BaseClient | None = None
        self._operation_count = 0

    def _build_client(self) -> BaseClient:
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

    def create_client(self) -> BaseClient:
        """Возвращает клиент, создавая его лениво (один на фабрику)"""
        if self._client is None:
            logger.info("Creating S3 client")
            self._client = self._build_client()
            logger.info("S3 client created successfully")
        return self._client

    def close_client(self):
        if self._client:
            logger.info("Closing S3 client...")
            self._client.close()
            self._client = None
            logger.info("S3 client closed")

    @asynccontextmanager
    async def get_connection(self) -> AsyncGenerator[BaseClient, None]:
        client = self.create_client()
        self._operation_count += 1
        request_id = id(client)

        logger.debug(
            f"Getting S3 connection #{self._operation_count} (client_id={request_id})"
        )

        try:
            yield client
            logger.debug(f"S3 connection #{self._operation_count} used successfully")
        except Exception as e:
            logger.error(f"S3 connection #{self._operation_count} failed: {e}")
            raise
        finally:
            logger.debug(f"S3 connection #{self._operation_count} released")
