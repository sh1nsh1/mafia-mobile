# Mafia Mobile

Кроссплатформенная реализация популярной игры

## Структура backend

```
backend/
├── src/                          # Исходный код
│   ├── api/                      # API
│   │   ├── v1/                   # Версия API
│   │   │   ├── routers/          # Роутеры
│   │   │   │   ├── e1.py
│   │   │   │   └── __init__.py
│   │   └── __init__.py
│   │
│   ├── core/                     # Ядро
│   │   ├── с1.py
│   │   └── __init__.py
│   │
│   ├── domain/                   # Доменная область
│   │   ├── models/               # Модели
│   │   │   ├── m1.py
│   │   │   └── __init__.py
│   │   │
│   │   ├── dtos/                 # DTO's
│   │   │   ├── dto1.py
│   │   │   └── __init__.py
│   │   │
│   │   └── services/             # Бизнес-логика
│   │       ├── service1.py
│   │       └── __init__.py
│   │
│   ├── infrastructure/           # Инфраструктура (внешние интеграции)
│   │   ├── database/             # База данных
│   │   │   ├── repositories/     # Паттерн Repository
│   │   │   │   ├── repo1.py
│   │   │   │   └── __init__.py
│   │   │   └── migrations/       # Миграции
│   │   │       └── versions/     # Версии
│   │   │
│   │   ├── cache/               # Redis, кэширование
│   │   ├── external/            # Внешние API клиенты
│   │   └── __init__.py
│   │
│   ├── utils/                   # Вспомогательные функции
│   │   ├── logging_config.py
│   │   ├── validators.py
│   │   └── __init__.py
│   │
│   └── main.py                  # Точка входа программы
│
├── tests/                       # Тесты
│   ├── unit/
│   ├── integration/
│   ├── test_config.py
│   └── __init__.py
│
├── alembic.ini                  # Конфиг Alembic
├── requirements.txt             # Необходимые зависимости
├── .gitignore.ini               # Файл Gitignore
├── .env.example                 # Шаблон локальных переменных
├── .env                         # Локальные переменные
├── docker-compose.yml           # Конфигурация контейнеро
├── Dockerfile                   # Образ (контейнер) backend
└── README.md                    # Инструкция
```

## Пример .env

```
DEEPSEEK_API_KEY=sk-2726e49c310548fc99c0f8418c89c188
DATABASE_URL=postgresql+asyncpg://postgres:1111@localhost:5432/mafia
REDIS_URL= redis://localhost:6379
SECRET_KEY=94246ce346bbe6fb3db96c8176e76268a8642be5842ee76ba6b762253504c385
JWT_ALGORITHM=HS256
DEBUG=True
POSTGRES_SERVER=postgresql+asyncpg
POSTGRES_USER=postgres
POSTGRES_PASSWORD=1111
POSTGRES_HOST=postgres
POSTGRES_DB=mafia
POSTGRES_PORT=5432
```
