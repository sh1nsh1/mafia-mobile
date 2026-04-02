import logging

from botocore.exceptions import ClientError

from infrastructure.factories import (
    S3ClientFactory,
    get_db_session_factory,
)
from infrastructure.environment import env
from infrastructure.database.models.base_model import Base


async def init_db():
    logger = logging.getLogger("init_db")
    logger.info("init_db")
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


async def init_s3():
    logger = logging.getLogger("init_s3")
    logger.info("init_s3")
    factory = S3ClientFactory()
    s3 = factory()
    bucket_name = env.s3.bucket_name
    try:
        s3.head_bucket(Bucket=bucket_name)
    except ClientError as e:
        error_code = e.response["Error"]["Code"]
        if error_code == "404":
            # Бакет не существует - создаём
            logger.debug(f"Creating bucket '{bucket_name}'...")
            s3.create_bucket(Bucket=bucket_name)
            logger.debug(f"Bucket '{bucket_name}' created successfully")
        else:
            logger.error(f"S3 error: {e}")
            raise
