from pydantic_settings import BaseSettings
from pydantic_settings import SettingsConfigDict


class Redis(BaseSettings):
    """Конфигурация Redis"""

    url: str

    model_config = SettingsConfigDict(env_prefix="REDIS_")


class Postgres(BaseSettings):
    """Конфигурация базы данных PostgreSql"""

    drivername: str = "postgresql+asyncpg"

    user: str

    password: str

    host: str
    """Имя хоста. Обычно `postgres` или `localhost`"""

    port: int

    db: str
    """Название базы данных"""

    model_config = SettingsConfigDict(env_prefix="POSTGRES_")


class Environment(BaseSettings):
    postgres: Postgres = Postgres()  # type: ignore
    redis: Redis = Redis()  # type: ignore


env = Environment()  # type: ignore
