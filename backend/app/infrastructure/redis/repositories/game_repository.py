import uuid

import redis.asyncio as redis

from domain.exceptions import (
    RepoException,
    LobbyIsFullException,
    LobbyNotFoundException,
    UserAlredyInLobbyException,
    ActionAlreadyPerformedException,
)
from infrastructure.dependencies.alias import RedisClientDep
from infrastructure.redis.models.game_model import GameModel


class GameRepository:
    def __init__(self, redis_client: RedisClientDep):
        self.redis = redis_client

        # Ключ для хэша лобби
        self.GAME_KEY = "game:{game_id}"
        # Ключ для сета lobby: (user)
        self.GAME_PARTICIPANTS_KEY = "game_participants:{game_id}"
        # Ключ для сета активных user (тех, что в каких-либо lobby)

        self.LOBBY_TTL = 600

    async def create_game(
        self, admin_id: str, max_players: int = 4
    ) -> GameModel:
        """
        Создание нового Lobby.
        """
        lobby_id = uuid.uuid4().hex[:8]

        lobby = GameModel(
            id=lobby_id,
            admin_id=admin_id,
            max_players=max_players,
            participant_ids=[admin_id],
        )

        # Используем pipeline для атомарного выполнения
        async with self.redis.pipeline(transaction=True) as pipe:
            # Сохраняем данные лобби

            await pipe.hset(
                self.LOBBY_KEY.format(lobby_id=lobby.id),
                mapping=lobby.to_dict(),
            )

            # Добавляем админа в участники лобби
            await pipe.sadd(
                self.LOBBY_PARTICIPANTS_KEY.format(lobby_id=lobby.id),
                lobby.admin_id,
            )

            await pipe.sadd(self.ACTIVE_USERS_KEY, lobby.admin_id)

            # Устанавливаем TTL для лобби
            await pipe.expire(
                self.LOBBY_KEY.format(lobby_id=lobby.id), self.LOBBY_TTL
            )

            await pipe.expire(
                self.LOBBY_PARTICIPANTS_KEY.format(lobby_id=lobby.id),
                self.LOBBY_TTL,
            )

            # Выполняем все команды
            await pipe.execute()

        return lobby

    async def get_lobby(self, lobby_id: str) -> GameModel | None:
        """
        Получение Lobby по ID.
        """
        # Получаем данные лобби из Hash
        lobby_data = await self.redis.hgetall(
            self.LOBBY_KEY.format(lobby_id=lobby_id)
        )

        if not lobby_data:
            return None

        data = {k.decode(): v.decode() for k, v in lobby_data.items()}
        lobby_participants_key = self.LOBBY_PARTICIPANTS_KEY.format(
            lobby_id=data["id"]
        )
        data["participant_ids"] = list(
            await self.redis.smembers(lobby_participants_key)
        )

        return GameModel.from_redis_data(data)

    async def add_participant(self, lobby_id: str, user_id: str) -> bool:
        """
        Добавление участника в Lobby по ID.
        """
        # Проверяем, не активен ли пользователь в каком-то лобби
        is_active = await self.redis.sismember(self.ACTIVE_USERS_KEY, user_id)
        if is_active:
            raise UserAlredyInLobbyException(
                "User is already active in lobby"
            )  # Пользователь уже в каком-то лобби

        # Проверяем, есть ли свободное место в лобби
        lobby = await self.get_lobby(lobby_id)
        if not lobby:
            raise LobbyNotFoundException(
                lobby_id=lobby_id
            )  # Данного лобби не сущетсвует

        if not lobby or len(lobby.participant_ids) >= lobby.max_players:
            raise LobbyIsFullException(
                "Lobby is full"
            )  # Нет свободного места в лобби

        # Используем WATCH для оптимистичной блокировки
        async with self.redis.pipeline(transaction=True) as pipe:
            try:
                lobby_participants_key = self.LOBBY_PARTICIPANTS_KEY.format(
                    lobby_id=lobby_id
                )
                # Начинаем наблюдение за участниками лобби
                await pipe.watch(lobby_participants_key)

                # Вторая проверка
                if await self.redis.sismember(self.ACTIVE_USERS_KEY, user_id):
                    await pipe.unwatch()
                    raise ActionAlreadyPerformedException(
                        "Actions already performed"
                    )

                # Начинаем транзакцию
                pipe.multi()

                # Обновляем список участников в лобби
                await pipe.sadd(lobby_participants_key, user_id)

                # Обновляем список активных пользователей
                await pipe.sadd(self.ACTIVE_USERS_KEY, user_id)

                # Продлеваем TTL лобби
                await pipe.expire(
                    self.LOBBY_KEY.format(lobby_id=lobby_id), self.LOBBY_TTL
                )

                # Продлеваем TTL участников лобби
                await pipe.expire(self.ACTIVE_USERS_KEY, self.LOBBY_TTL)

                # Выполняем транзакцию
                await pipe.execute()
                return True

            except redis.WatchError as e:
                print(e)
                raise RepoException("Some actions in another sesstion")

    async def remove_participant(self, lobby_id: str, user_id: str) -> bool:
        """
        Удаление участника из лобби.
        Если удаляется админ, лобби удаляется полностью.
        """
        lobby = await self.get_lobby(lobby_id)
        if not lobby:
            return False

        # Если удаляем админа - удаляем и само лобби
        if user_id == lobby.admin_id:
            return await self.delete_lobby(lobby_id)

        async with self.redis.pipeline(transaction=True) as pipe:
            lobby_participants_key = self.LOBBY_PARTICIPANTS_KEY.format(
                lobby_id=lobby_id
            )
            await pipe.watch(lobby_participants_key)
            await pipe.watch(self.ACTIVE_USERS_KEY)

            pipe.multi()
            await pipe.srem(lobby_participants_key, user_id)
            await pipe.srem(self.ACTIVE_USERS_KEY, user_id)

            await pipe.execute()
        return True

    async def delete_lobby(self, lobby_id: str) -> bool:
        """
        Полное удаление лобби.
        """
        lobby = await self.get_lobby(lobby_id)
        if not lobby:
            return False

        async with self.redis.pipeline(transaction=True) as pipe:
            # Удаляем данные лобби
            await pipe.delete(self.LOBBY_KEY.format(lobby_id=lobby_id))
            await pipe.delete(
                self.LOBBY_PARTICIPANTS_KEY.format(lobby_id=lobby_id)
            )
            await pipe.execute()
        return True

    async def prepaire_for_game(self, lobby_id: str) -> str | None:
        """
        Начинает игру: переносит данные из лобби в игру и удаляет лобби.
        """
        game_id = f"game_{uuid.uuid4().hex[:8]}"

        lobby = await self.get_lobby(lobby_id)
        if not lobby:
            return None

        lobby.game_id = game_id
        await self.redis.hset(
            self.LOBBY_KEY.format(lobby_id=lobby_id), mapping=lobby.to_dict()
        )
        return game_id

    async def _save_game_to_db(self, game_id: str, lobby: GameModel):
        """
        Асинхронное сохранение игры в БД (история).
        Вызывается после создания игры.
        """
        # Здесь будет логика сохранения в PostgreSQL/MySQL
        # Например, через asyncpg или SQLAlchemy с asyncio
        pass

    async def update_lobby_max_players(
        self, lobby_id: str, max_players: int
    ) -> bool:
        """
        Обновление максимального количества игроков в лобби.
        """
        lobby = await self.get_lobby(lobby_id)
        if not lobby:
            return False

        # Проверяем, что новое значение не меньше текущего количества игроков
        if max_players < len(lobby.participant_ids):
            return False

        updated = await self.redis.hset(
            self.LOBBY_KEY.format(lobby_id=lobby_id),
            "max_players",
            str(max_players),
        )

        return updated >= 0

    async def cleanup_expired_lobbies(self):
        """
        Очистка устаревших лобби.
        Redis автоматически удалит ключи с истекшим TTL,
        но мы можем оставить этот метод для будущих улучшений.
        """
        # В текущей схеме Redis сам удалит ключи с TTL
        # Этот метод может быть полезен для дополнительной логики
        pass
