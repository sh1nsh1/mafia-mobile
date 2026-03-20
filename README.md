# Mafia Mobile

Кроссплатформенная реализация популярной игры

Мафия — это игра в жанре социальной дедукции, где игроки делятся на команды мирных жителей и мафии, пытаясь распознать или скрыть свою роль через голосования и обсуждения.

## Технологический стек

### Клиент

Expo SDK 55 + React Native 0.83.2 + React 19.2.0

Также используется: expo-router, react-hook-form, rxjs, zustand, zod

### Бэкенд

FastAPI 0.128.0

Также используется: pydantic, sqlalchemy, asyncpg, redis, pyjwt, websockets

Для хранения данных используется PostgreSQL, а для кеширования Redis

## Способы запуска

### Docker

Для запуска необходим `docker compose` и `.env` файл в корне проекта

> В `docker` поднимается веб-версия приложения

Пример `.env`:

```
DEEPSEEK_API_KEY=<ваш_ключ_api_тут>
DATABASE_URL=postgresql+asyncpg://postgres:1111@localhost:5432/mafia
REDIS_URL=redis://redis:6379
JWT_SECRET_KEY=<сгенерированный_секретный_ключ>
JWT_ALGORITHM=HS256
DEBUG=True
POSTGRES_SERVER=postgresql+asyncpg
POSTGRES_USER=postgres
POSTGRES_PASSWORD=1111
POSTGRES_HOST=postgres
POSTGRES_DB=mafia
POSTGRES_PORT=5432
```

Запускается стандартно:

```bash
docker compose up
```

### Ручной запуск

Также можно запускать все части проекта отдельно.

Бэкенд:

```bash
cd backend
uv run fastapi dev
```

Клиент (веб-версия):

```bash
cd client
npm run start
```

Если нужен именно билд под андроид, то можно использовать `eas-cli`

```bash
# Установка EAS CLI
npm install -g @expo/eas-cli

# Логин в Expo аккаунт
eas login

# Сборка под Android
eas build --platform android --profile production
```
