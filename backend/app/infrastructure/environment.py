from pydantic_settings import BaseSettings
from pydantic_settings import SettingsConfigDict


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


env = Environment()  # type: ignore
