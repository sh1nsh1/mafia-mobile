# Mafia

![Python](https://img.shields.io/badge/python-232730?style=for-the-badge&logo=python)
![FastAPI](https://img.shields.io/badge/fastapi-232730?style=for-the-badge&logo=fastapi)
![PostgreSQL](https://img.shields.io/badge/postgresql-232730?style=for-the-badge&logo=postgresql)
![Redis](https://img.shields.io/badge/redis-232730?style=for-the-badge&logo=redis)

Кроссплатформенная реализация популярной игры

Мафия — это игра в жанре социальной дедукции, где игроки делятся на команды мирных жителей и мафии, пытаясь распознать или скрыть свою роль через голосования и обсуждения.

> Здесь только бэкенд. Фронтенд — в [отдельном репозитории](https://github.com/decisivestrike/mafia-client).

## Технологический стек

FastAPI 0.128.0

Также используется: pydantic, sqlalchemy, asyncpg, redis, pyjwt, websockets

Для хранения данных используется PostgreSQL, а для кеширования Redis

## Способы запуска

### Docker

Для запуска необходим `docker compose` и `.env` файл в корне проекта

Пример `.env`:

```bash
DEEPSEEK_API_KEY=iamabluewhale
DATABASE_URL=postgresql+asyncpg://localhost:1111@localhost:5432/mafia
REDIS_URL=redis://localhost:6379
DEBUG=True

JWT_SECRET_KEY=guessme
JWT_ALGORITHM=HS256

POSTGRES_SERVER=postgresql+asyncpg
POSTGRES_USER=postgres
POSTGRES_PASSWORD=mysqlsucks
POSTGRES_HOST=localhost
POSTGRES_DB=mafia
POSTGRES_PORT=5432

RUSTFS_VOLUMES=/data/rustfs
RUSTFS_ADDRESS=0.0.0.0:9000
RUSTFS_CONSOLE_ADDRESS=0.0.0.0:9001
RUSTFS_CONSOLE_ENABLE=true
RUSTFS_CORS_ALLOWED_ORIGINS=*
RUSTFS_CONSOLE_CORS_ALLOWED_ORIGINS=*
RUSTFS_ACCESS_KEY=access
RUSTFS_SECRET_KEY=secret
RUSTFS_BUCKET_NAME=bucket
```

Запускается так:

```bash
docker compose --profile all up
```

### Ручной запуск

Также можно запускать все части проекта отдельно.

Бэкенд:

```bash
cd backend
uv run fastapi dev
```
