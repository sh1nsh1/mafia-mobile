import uuid
import logging
from uuid import UUID
from typing import Annotated

import redis.asyncio as redis
from fastapi import Depends

from domain.exceptions import (
    RepoException,
    LobbyIsFullException,
    LobbyNotFoundException,
    UserNotInLobbyException,
    UserAlredyInLobbyException,
    ActionAlreadyPerformedException,
)
from domain.entities.lobby import Lobby
from infrastructure.dependencies.alias import RedisClientDep
from infrastructure.redis.models.lobby_model import LobbyModel
from infrastructure.database.repositories.user_repository import UserRepositoryDep


class LobbyRepository:
    def __init__(self, redis_client: RedisClientDep, user_repostory: UserRepositoryDep):
        self.redis = redis_client
        self.user_repository = user_repostory
        # Ключ для хэша лобби
        self.LOBBY_KEY = "lobby:{lobby_id}"
        # Ключ для сета lobby: [user]
        self.LOBBY_PARTICIPANTS_KEY = "lobby_participants:{lobby_id}"
        # Ключ для  активных user (тех, что в каких-либо lobby)
        self.ACTIVE_USERS_KEY = "lobby_active_users"

        self.logger = logging.getLogger(self.__class__.__name__)
        self.LOBBY_TTL = 600

    async def create_lobby(self, admin_id: UUID, max_players: int = 10) -> Lobby:
        """
        Создаёт новое лобби
        Args:
            admin_id (int): ID пользователя
            max_players (int): максимальное количество игроков
        Returns:
            Lobby: Доменная сущность Lobby
        """
        self.logger.debug("call create_lobby")
        active_lobby = await self.get_user_active_lobby(admin_id)
        if active_lobby:
            raise UserAlredyInLobbyException(
                "You can't create a lobby if you are in other one"
            )

        lobby_id = uuid.uuid4().hex[:8]

        lobby_model = LobbyModel(
            id=lobby_id,
            admin_id=admin_id,
            max_players=max_players,
            participant_ids=[admin_id],
        )

        # Используем pipeline для атомарного выполнения
        async with self.redis.pipeline(transaction=True) as pipe:
            # Сохраняем данные лобби

            await pipe.hset(
                self.LOBBY_KEY.format(lobby_id=lobby_model.id),
                mapping=lobby_model.to_dict(),
            )

            # Добавляем админа в участники лобби
            await pipe.sadd(
                self.LOBBY_PARTICIPANTS_KEY.format(lobby_id=lobby_model.id),
                str(lobby_model.admin_id),
            )

            # Добавляем админа в активных пользователей и свзываем с лобби
            await pipe.hset(
                self.ACTIVE_USERS_KEY, str(lobby_model.admin_id), lobby_model.id
            )

            # Устанавливаем TTL для лобби
            await pipe.expire(
                self.LOBBY_KEY.format(lobby_id=lobby_model.id), self.LOBBY_TTL
            )

            # Устанавливаем TTL для списка участников лобби
            await pipe.expire(
                self.LOBBY_PARTICIPANTS_KEY.format(lobby_id=lobby_model.id),
                self.LOBBY_TTL,
            )

            await pipe.execute_command(
                "HEXPIRE",
                self.ACTIVE_USERS_KEY,
                self.LOBBY_TTL,
                "FIELDS",
                1,
                lobby_model.admin_id,
            )

            # Выполняем все команды
            await pipe.execute()

        return await self._model_to_domain(lobby_model)

    async def get_lobby_by_id(self, lobby_id: str) -> Lobby | None:
        """
        Получает Lobby по его ID, если оно существует, иначе None
        Args:
            lobby_id (str): Lobby ID
        Returns:
            lobby (Lobby | None): Доменная сущность Lobby или None
        """
        self.logger.debug(f"call get_lobby_by_id ({lobby_id})")
        lobby_model = await self._get_lobby_model_by_id(lobby_id)
        self.logger.debug(f"get_lobby_by_id got {lobby_model}")
        if not lobby_model:
            return None
        return await self._model_to_domain(lobby_model)

    async def get_all(self):
        """Получение всех лобби"""
        lobby_keys = self.redis.scan_iter(match="lobby:*")

        return [await self.get_lobby_by_id(lobby_id) for lobby_id in lobby_keys]

    async def add_participant(self, lobby_id: str, user_id: UUID) -> None:
        """
        Добавление участника с в Lobby.
        Args:
            lobby_id (str): Lobby ID
            user_id (int): User ID
        Raises:
            UserAlredyInLobbyException: User уже в каком-то лобби
            LobbyNotFoundException: Lobby не сущетсвует
        """
        self.logger.debug("call add_participant")
        # Проверяем, не активен ли пользователь в каком-то лобби
        if await self._get_user_active_lobby_id(user_id):
            raise UserAlredyInLobbyException("User is already active in lobby")

        # Проверяем, есть ли свободное место в лобби
        lobby_model = await self._get_lobby_model_by_id(lobby_id)
        if not lobby_model:
            raise LobbyNotFoundException(
                lobby_id=lobby_id
            )  # Данного лобби не сущетсвует

        if (
            not lobby_model
            or len(lobby_model.participant_ids) >= lobby_model.max_players
        ):
            raise LobbyIsFullException("Lobby is full")  # Нет свободного места в лобби

        # Используем WATCH для оптимистичной блокировки
        async with self.redis.pipeline(transaction=True) as pipe:
            try:
                lobby_participants_key = self.LOBBY_PARTICIPANTS_KEY.format(
                    lobby_id=lobby_id
                )
                # Начинаем наблюдение за участниками лобби
                await pipe.watch(lobby_participants_key)

                # Вторая проверка
                if await self._get_user_active_lobby_id(user_id):
                    await pipe.unwatch()
                    raise ActionAlreadyPerformedException("Actions already performed")

                # Начинаем транзакцию
                pipe.multi()

                # Добавляем пользователя в список участников лобби
                await pipe.sadd(lobby_participants_key, str(user_id))

                # Добавляем пользователя в список активных пользователй
                await pipe.hset(self.ACTIVE_USERS_KEY, str(user_id), lobby_id)

                # Продлеваем TTL лобби
                await pipe.expire(
                    self.LOBBY_KEY.format(lobby_id=lobby_id), self.LOBBY_TTL
                )
                # Продлеваем TTL списка участников лобби
                await pipe.expire(
                    self.LOBBY_PARTICIPANTS_KEY.format(lobby_id=lobby_id),
                    self.LOBBY_TTL,
                )
                # Определяем TLL для ключа активного пользователя
                await pipe.execute_command(
                    "HEXPIRE",
                    self.ACTIVE_USERS_KEY,
                    self.LOBBY_TTL,
                    "FIELDS",
                    1,
                    str(self._get_user_active_lobby_id),
                )

                # Выполняем транзакцию
                await pipe.execute()

            except redis.WatchError as e:
                print(e)
                raise RepoException("Some actions in another sesstion")

    async def remove_participant(self, lobby_id: str, user_id: UUID) -> None:
        """
        Удаление User из Lobby.

        Если удаляется админ, Lobby удаляется полностью.
        Args:
            lobby_id (str): Lobby ID
            user_id (int): User ID
        Raises:
            LobbyNotFoundException: Lobby не сущетсвует
        """
        self.logger.debug("call remove_participant")
        lobby_model = await self._get_lobby_model_by_id(lobby_id)
        if not lobby_model:
            raise LobbyNotFoundException(lobby_id=lobby_id)

        active_lobby_id = await self._get_user_active_lobby_id(user_id)
        if not active_lobby_id:
            raise UserNotInLobbyException()

        # Если удаляем админа - удаляем и само лобби
        if user_id == lobby_model.admin_id:
            return await self.delete_lobby(lobby_id)

        async with self.redis.pipeline(transaction=True) as pipe:
            lobby_participants_key = self.LOBBY_PARTICIPANTS_KEY.format(
                lobby_id=lobby_id
            )
            await pipe.watch(lobby_participants_key)
            await pipe.watch(self.ACTIVE_USERS_KEY)

            pipe.multi()
            await pipe.srem(lobby_participants_key, str(user_id))
            await pipe.hdel(self.ACTIVE_USERS_KEY, str(user_id))

            await pipe.execute()

    async def delete_lobby(self, lobby_id: str) -> None:
        """
        Полное удаление лобби.
        Args:
            lobby_id (str): Lobby ID
        Raises:
            LobbyNotFoundException: Lobby не сущетсвует
        """
        self.logger.debug("call delete_lobby")
        lobby_model = await self._get_lobby_model_by_id(lobby_id)
        if not lobby_model:
            raise LobbyNotFoundException(lobby_id=lobby_id)

        async with self.redis.pipeline(transaction=True) as pipe:
            lobby_participants_key = self.LOBBY_PARTICIPANTS_KEY.format(
                lobby_id=lobby_id
            )

            # Удаляем данные лобби
            await pipe.delete(self.LOBBY_KEY.format(lobby_id=lobby_id))
            active_user_ids = await pipe.smembers(lobby_participants_key)
            await pipe.hdel(self.ACTIVE_USERS_KEY, *active_user_ids)
            await pipe.delete(lobby_participants_key)

            await pipe.execute()

    async def create_game_id(self, lobby_id: str) -> str:
        """
        Создаёт Game ID для Lobby
        Args:
            lobby_id (str): Lobby ID
        Returns:
            game_id (str): Game ID
        Raises:
            LobbyNotFoundException: Lobby не сущетсвует
        """
        self.logger.debug("call create_game_id ({lobby_id})")
        game_id = f"game_{uuid.uuid4().hex[:8]}"

        lobby_model = await self._get_lobby_model_by_id(lobby_id)
        if not lobby_model:
            raise LobbyNotFoundException()

        lobby_model.game_id = game_id

        await self.redis.hset(
            self.LOBBY_KEY.format(lobby_id=lobby_id),
            mapping=lobby_model.to_dict(),
        )
        return game_id

    async def update_lobby_max_players(self, lobby_id: str, max_players: int) -> None:
        """
        Обновление максимального количества участников Lobby.
        Args:
            lobby_id (str): Lobby ID
            max_players (int): Максимальное количиство участников
        Raises:
            LobbyNotFoundException: Lobby не сущетсвует
        """
        self.logger.debug("call update_lobby_max_players")
        lobby_model = await self._get_lobby_model_by_id(lobby_id)
        if not lobby_model:
            raise LobbyNotFoundException(
                lobby_id=lobby_id
            )  # Данного лобби не сущетсвует

        # Проверяем, что новое значение не меньше текущего количества игроков
        if max_players < len(lobby_model.participant_ids):
            raise LobbyIsFullException(
                "New max player count is less than current number of participants"
            )

        await self.redis.hset(
            self.LOBBY_KEY.format(lobby_id=lobby_id),
            "max_players",
            str(max_players),
        )

    async def get_user_active_lobby(self, user_id: UUID) -> Lobby | None:
        """
        Внутренний метод: Получает Lobby ID в котором находится User c указанным ID
        Args:
            user_id (int): User ID
        Returns:
            lobby (str / None): Доменная модель Lobby
        """
        self.logger.debug(f"call get_user_active_lobby ({user_id})")
        lobby_id = await self._get_user_active_lobby_id(user_id)
        if lobby_id:
            lobby = await self.get_lobby_by_id(lobby_id)
            self.logger.debug(f"get_user_active_lobby {lobby}")

            return lobby

    async def _get_user_active_lobby_id(self, user_id: UUID) -> str | None:
        """
        Внутренний метод: Получает Lobby ID в котором находится User c указанным ID
        Args:
            user_id (int): User ID
        Returns:
            lobby_id (str / None): ID модели Lobby
        """
        self.logger.debug(f"call _get_user_active_lobby_id ({user_id})")
        all_active_users = await self.redis.hgetall(self.ACTIVE_USERS_KEY)
        self.logger.debug(f"all acttive users {all_active_users.items()}")
        lobby_id = await self.redis.hget(self.ACTIVE_USERS_KEY, str(user_id))
        lobby_id = lobby_id.decode() if isinstance(lobby_id, bytes) else lobby_id
        self.logger.debug(f"_get_user_active_lobby_id {lobby_id}")
        return lobby_id

    async def _get_lobby_model_by_id(self, lobby_id: str) -> LobbyModel | None:
        """
        Внутренний метод: Получает Lobby по ID
        Args:
            lobby_id (str): Lobby ID
            user_id (int): User ID
        Returns:
            lobby_model (LobbyModel / None): Модель Lobby
        """
        self.logger.debug(f"call _get_lobby_model_by_id ({lobby_id})")
        lobby_data = await self.redis.hgetall(self.LOBBY_KEY.format(lobby_id=lobby_id))
        if not lobby_data:
            return None

        data = {k.decode(): v.decode() for k, v in lobby_data.items()}
        self.logger.debug(data.items())
        lobby_participants_key = self.LOBBY_PARTICIPANTS_KEY.format(lobby_id=data["id"])
        data["participant_ids"] = [
            user_id.decode()
            for user_id in await self.redis.smembers(lobby_participants_key)
        ]

        return LobbyModel.from_redis_data(data)

    async def _cleanup_active_users(self):
        async with self.redis.pipeline(transaction=True) as pipe:
            await pipe.delete(self.ACTIVE_USERS_KEY)
            await pipe.execute()

    async def _model_to_domain(self, lobby_model: LobbyModel) -> Lobby:
        """
        Внутренний метод: Преобразует модель в доменную сущность
        Args:
            lobby_model (LobbyModel): Модель Lobby
        Returns:
            lobby (Lobby): Доменная сущность Lobby
        """
        self.logger.debug("call _model_to_domain")
        participants = []
        for user_id in lobby_model.participant_ids:
            self.logger.debug(f"_model_to_domain got {user_id}")
            user = await self.user_repository.get_user_by_id(UUID(user_id))
            if user:
                participants.append(user)

        return Lobby(
            id=lobby_model.id,
            admin=participants[0],
            max_players=int(lobby_model.max_players),
            partipants=participants,
            created_at=lobby_model.created_at,
            game_id=lobby_model.game_id,
        )

    async def _domain_to_model(self, lobby: Lobby) -> LobbyModel:
        """
        Внутренний метод: Преобразует доменную сущность в модель
        Args:
            lobby (Lobby): Доменная сущность Lobby
        Returns:
            lobby_model (LobbyModel): Модель Lobby
        """
        self.logger.debug("call _domain_to_model")
        participant_ids = []
        for user in lobby.participants:
            if user.id:
                participant_ids.append(user.id)
        return LobbyModel(
            lobby.id,
            str(lobby.admin.id),
            lobby.max_players,
            participant_ids,
            lobby.created_at,
            lobby.game_id,
        )


LobbyRepositoryDep = Annotated[LobbyRepository, Depends()]
