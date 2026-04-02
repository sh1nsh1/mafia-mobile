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


class RustFS(BaseEnv):
    volumes: str
    address: str
    console_address: str
    console_enable: str
    cors_allowed_origins: str
    console_cors_allowed_origins: str
    access_key: str
    secret_key: str
    bucket_name: str
    model_config = SettingsConfigDict(env_prefix="RUSTFS_")


class Environment:
    postgres: Postgres = Postgres()
    redis: Redis = Redis()
    jwt: JWT = JWT()
    s3: RustFS = RustFS()


env = Environment()
