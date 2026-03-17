import uuid
from typing import Annotated
from datetime import datetime

from fastapi import Depends

from domain.enums import TeamEnum, GameStageEnum, GameStatusEnum, PlayerStatusEnum
from domain.exceptions import (
    RepoException,
)
from domain.entities.game import Game
from domain.entities.player import Role, Player
from infrastructure.factories import RedisClientDep
from infrastructure.redis.models.game_model import GameModel
from infrastructure.redis.models.player_model import PlayerModel
from infrastructure.database.repositories.user_repository import UserRepositoryDep


class GameRepository:
    def __init__(
        self, _redis_client: RedisClientDep, user_repository: UserRepositoryDep
    ):
        self.redis = _redis_client
        self._user_repository = user_repository

        # Ключ для хэша лобби
        self.GAME_KEY = "game:{game_id}"
        # Ключ для сета lobby: (user)
        self.GAME_PARTICIPANTS_KEY = "game_participants:{game_id}"
        # Ключ для хранения информации об игроке
        self.PLAYER_KEY = "player:{player_user_id}"
        # Ключ для хранения активных игроков
        self.ACTIVE_USERS_KEY = "active_users"

    async def get_game_by_id(self, game_id: str) -> Game | None:
        """
        Получить доменную сущность Game
        """
        game_model = await self._get_game_model_by_id(game_id)
        return await self._model_to_domain(game_model) if game_model else None

    async def create_game(self, game: Game):
        """
        Создание новой игры
        """
        player_models = [await self._player_to_model(player) for player in game.players]
        game_model = await self._domain_to_model(game)

        # Используем pipeline для атомарного выполнения
        async with self.redis.pipeline(transaction=True) as pipe:
            # Сохраняем данные игры
            await pipe.hset(
                self.GAME_KEY.format(game_id=game_model.id),
                mapping=game_model.to_dict(),
            )

            # Сохраняем данные всех игроков
            for player_model in player_models:
                if player_model:
                    # сохранить данные игрока
                    await pipe.hset(
                        self.PLAYER_KEY.format(player_id=player_model.user_id),
                        mapping=player_model.to_dict(),
                    )
                    # связать игрока с игрой
                    await pipe.sadd(
                        self.GAME_PARTICIPANTS_KEY.format(game_id=game_model.id),
                        player_model.user_id,
                    )

            # Выполняем все команды
            await pipe.execute()

    async def save_game(self, game: Game):
        """
        Сохранение Game в Redis
        """
        game_model = await self._domain_to_model(game)
        player_models = [
            await self._get_player_model_by_user_id(player_user_id)
            for player_user_id in game_model.player_ids
        ]
        # Используем pipeline для атомарного выполнения
        async with self.redis.pipeline(transaction=True) as pipe:
            # Сохраняем данные игры
            await pipe.hset(
                self.GAME_KEY.format(game_id=game_model.id),
                mapping=game_model.to_dict(),
            )

            # Сохраняем данные всех игроков
            for player_model in player_models:
                if player_model:
                    # сохранить данные игрока
                    await pipe.hset(
                        self.PLAYER_KEY.format(player_id=player_model.user_id),
                        mapping=player_model.to_dict(),
                    )
                    # связать игрока с игрой
                    await pipe.sadd(
                        self.GAME_PARTICIPANTS_KEY.format(game_id=game_model.id),
                        player_model.user_id,
                    )

            # Выполняем все команды
            await pipe.execute()

    async def remove_player(self, game_id: str, player_user_id: str) -> bool:
        """
        Удаление участника из Game.
        Если удаляется админ, Game удаляется полностью.
        """
        game_model = await self._get_game_model_by_id(game_id)

        if not game_model:
            return False

        # Если удаляем админа - удаляем и само лобби
        if player_user_id == game_model.admin_id:
            return await self.delete_game(game_id)

        async with self.redis.pipeline(transaction=True) as pipe:
            game_participants_key = self.GAME_PARTICIPANTS_KEY.format(game_id=game_id)

            await pipe.watch(game_participants_key)
            await pipe.watch(self.ACTIVE_USERS_KEY)

            pipe.multi()
            # удалить игрока из списка игроков
            await pipe.srem(game_participants_key, player_user_id)
            # удалить игрока из хэша активных пользователей
            await pipe.hdel(self.ACTIVE_USERS_KEY, player_user_id)
            # удалить данные игрока
            await pipe.delete(self.PLAYER_KEY.format(player_user_id=player_user_id))

            await pipe.execute()

        return True

    async def delete_game(self, game_id: str) -> bool:
        """
        Полное удаление Game.
        """
        game_model = await self._get_game_model_by_id(game_id)

        if not game_model:
            return False

        async with self.redis.pipeline(transaction=True) as pipe:
            game_participants_key = self.GAME_PARTICIPANTS_KEY.format(game_id=game_id)

            # Удаляем данные игры
            await pipe.delete(self.GAME_KEY.format(game_id=game_id))
            # Удаляем пользователей из списка активных
            active_user_ids = await pipe.smembers(game_participants_key)
            await pipe.hdel(self.ACTIVE_USERS_KEY, *active_user_ids)
            # Удаляем список игроков игры
            await pipe.delete(game_participants_key)

            await pipe.execute()

        return True

    async def get_player_by_user_id(self, player_user_id: str) -> Player:
        user = await self._user_repository.get_user_by_id(uuid.UUID(player_user_id))
        if not user:
            raise RepoException(f"User {player_user_id} not found in DB")

        player_model = await self._get_player_model_by_user_id(player_user_id)
        if not player_model:
            raise RepoException(f"Player {player_user_id} not found in Redis")

        player_status_list = [
            PlayerStatusEnum(status) for status in player_model.status_list.split("|")
        ]

        role_cls = globals()[player_model.role_name.value]
        if role_cls not in Role.__subclasses__():
            raise RepoException(f"Unknown role {role_cls}")

        return Player(
            user=user,
            role=role_cls(),
            status_list=player_status_list,
            is_alive=player_model.is_alive,
            votes_count=player_model.votes_count,
        )

    async def _get_game_model_by_id(self, game_id: str) -> GameModel | None:
        """
        Получение Game по ID.
        """
        # Получаем данные лобби из Hash
        binary_game_data = await self.redis.hgetall(
            self.GAME_KEY.format(game_id=game_id)
        )

        if not binary_game_data:
            return None

        data = {k.decode(): v.decode() for k, v in binary_game_data.items()}

        game_participants_key = self.GAME_PARTICIPANTS_KEY.format(game_id=data["id"])
        data["player_ids"] = list(await self.redis.smembers(game_participants_key))

        return GameModel.from_redis_data(data)

    async def _save_game_to_db(self, game_id: str, lobby: GameModel):
        """
        Асинхронное сохранение игры в БД (история).
        Вызывается после создания игры.
        """
        # Здесь будет логика сохранения в PostgreSQL/MySQL
        # Например, через asyncpg или SQLAlchemy с asyncio
        pass

    async def _domain_to_model(self, game: Game) -> GameModel:
        """
        Внутренний метод: Преобразует доменную сущность в модель
        Args:
            game (Game): Доменная сущность Game
        Returns:
            game_model (GameModel): Модель Game
        """
        game_model = GameModel(
            id=game.id,
            player_ids=[player.user.id for player in game.players],
            admin_id=game.admin.id,
            round_count=game.round_count,
            start_date=game.start_date.isoformat(),
            game_status=game.game_status,
            game_stage=game.game_stage,
            winner_team=game.winner_team,
            finish_date=game.finish_date.isoformat() if game.finish_date else None,
        )
        return game_model

    async def _model_to_domain(self, game_model: GameModel) -> Game:
        players = [
            await self.get_player_by_user_id(player_user_id)
            for player_user_id in game_model.player_ids
        ]

        admin = await self._user_repository.get_user_by_id(
            uuid.UUID(game_model.admin_id)
        )
        if not admin:
            raise RepoException("admin not found in game {game_model.id}")
        game = Game(
            id=game_model.id,
            players=players,
            admin=admin,
            start_date=datetime.fromisoformat(game_model.start_date),
            winner_team=TeamEnum(game_model.winner_team),
            game_status=GameStatusEnum(game_model.game_status),
            game_stage=GameStageEnum(game_model.game_stage),
            finish_date=datetime.fromisoformat(game_model.finish_date)
            if game_model.finish_date
            else None,
            round_count=game_model.round_count,
        )

        return game

    async def _player_to_model(self, player: Player) -> PlayerModel:
        return PlayerModel(
            str(player.user.id),
            player.is_alive,
            player.votes_count,
            player.role.role_name,
            "|".join([status.value for status in player.status_list]),
        )

    async def _get_player_model_by_user_id(
        self, player_user_id: str
    ) -> PlayerModel | None:
        player_data = await self.redis.hgetall(
            self.PLAYER_KEY.format(player_user_id=player_user_id)
        )
        if not player_data:
            return None
        decoded_data = {k.decode(): v.decode() for k, v in player_data.items()}
        return PlayerModel.from_redis_data(decoded_data)


GameRepositoryDep = Annotated[GameRepository, Depends()]
