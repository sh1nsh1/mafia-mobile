# Mafia Mobile

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