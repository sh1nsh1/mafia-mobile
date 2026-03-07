import os
from pprint import pprint

from dotenv.main import load_dotenv
from pydantic_settings import BaseSettings, SettingsConfigDict


class BaseEnv(BaseSettings):
    model_config = SettingsConfigDict(
        env_file=".env", env_file_encoding="utf-8", extra="ignore"
    )


class Redis(BaseEnv):
    """Конфигурация Redis"""

    url: str

    model_config = SettingsConfigDict(env_prefix="REDIS_")


class Postgres(BaseEnv):
    """Конфигурация базы данных PostgreSql"""

    drivername: str = "postgresql+asyncpg"
    user: str
    password: str
    host: str
    port: int
    db: str

    model_config = SettingsConfigDict(env_prefix="POSTGRES_")


class JWT(BaseEnv):
    """Конфигурация JWT"""

    algorithm: str
    secret_key: str

    model_config = SettingsConfigDict(env_prefix="JWT_")


class Environment:
    postgres: Postgres = Postgres()
    redis: Redis = Redis()
    jwt: JWT = JWT()


load_dotenv("../.env")
pprint(os.environ)
env = Environment()
