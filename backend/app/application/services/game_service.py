import logging
from typing import Annotated

from fastapi import Depends

from domain.enums import RoleEnum
from domain.entities.game import Game
from domain.entities.lobby import Lobby
from domain.entities.player import Player
from domain.services.role_distribution_service import RoleDistributionServiceDep
from infrastructure.websocket.dtos.websocket_command import WebSocketCommand
from infrastructure.redis.repositories.game_repository import GameRepositoryDep


class GameService:
    """
    Сервис для управления единичными операциями над сущностью Game
    """

    def __init__(
        self,
        game_repository: GameRepositoryDep,
        role_distribution_service: RoleDistributionServiceDep,
    ):
        self._game_repository = game_repository
        self._role_distribution_service = role_distribution_service
        self._logger = logging.getLogger(self.__class__.__name__)

    async def create_game_from_lobby(
        self, lobby: Lobby, role_set: list[RoleEnum]
    ) -> Game:
        """
        Создаёт игру из лобии, сохраняет её в лобби и возвращает её
        """

        self._logger.debug("create_game_from_lobby")
        game = Game(
            id=lobby.id,
            players=await self._role_distribution_service.create_players_with_roles(
                lobby.participants, role_set
            ),
            admin=lobby.admin,
        )

        await self._game_repository.create_game(game)
        return game

    async def save_game(self, game: Game) -> None:
        """
        Сохраняет игру в репозиторий
        """
        await self._game_repository.save_game(game)

    async def process_role_action(self, game_command: WebSocketCommand) -> None:
        """
        Обрабатывает ночной ход игрока
        """
        game = await self.get_game_by_id(game_command.room_id)
        await game.process_role_action(game_command.actor_id, game_command.target_id)
        await self.save_game(game)

    async def process_vote(self, game_command: WebSocketCommand) -> None:
        """
        Обрабатывает голос игрока
        """
        game = await self.get_game_by_id(game_command.room_id)
        await game.process_vote(game_command.actor_id, game_command.target_id)
        await self.save_game(game)

    async def get_game_by_id(self, game_id: str) -> Game:
        """
        Получает Game из репозитория
        """
        game = await self._game_repository.get_game_by_id(game_id)
        if not game:
            raise
        return game

    async def get_unacted_players(self, game: Game) -> list[Player]:
        """
        Получает список несходивших игроков
        """
        return await game.get_unacted_players()


GameServiceDep = Annotated[GameService, Depends()]
