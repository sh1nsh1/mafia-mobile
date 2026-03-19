import logging
from typing import Annotated

from fastapi import Depends

from domain.enums import RoleEnum, GameStageEnum
from domain.entities.game import Game
from domain.entities.lobby import Lobby
from domain.entities.player import Player
from domain.services.role_distribution_service import RoleDistributionServiceDep
from infrastructure.redis.repositories.game_repository import GameRepositoryDep
from infrastructure.redis.repositories.lobby_repository import LobbyRepositoryDep
from infrastructure.websocket.dtos.websocket_game_command import WebSocketGameCommand


class GameService:
    """
    Сервис для управления единичными операциями над сущностью Game
    """

    def __init__(
        self,
        game_repository: GameRepositoryDep,
        lobby_repostory: LobbyRepositoryDep,
        role_distribution_service: RoleDistributionServiceDep,
    ):
        self._game_repository = game_repository
        self._lobby_reposiroty = lobby_repostory
        self._role_distribution_service = role_distribution_service
        self._logger = logging.getLogger(self.__class__.__name__)

    async def create_game_from_lobby(
        self, lobby: Lobby, role_set: list[RoleEnum]
    ) -> Game:
        """
        Создаёт игру из лобби, сохраняет её в лобби и возвращает её
        """
        self._logger.debug("create_game_from_lobby")
        game = Game(
            id=lobby.id,
            players=await self._role_distribution_service.create_players_with_roles(
                lobby.participants, role_set
            ),
            admin=lobby.admin,
        )

        await self._lobby_reposiroty.prepare_for_game(lobby.id)
        await self._game_repository.create_game(game)
        return game

    async def save_game(self, game: Game) -> None:
        """
        Сохраняет игру в репозиторий
        """
        await self._game_repository.save_game(game)

    async def process_role_action(self, game_command: WebSocketGameCommand) -> None:
        """
        Обрабатывает ночной ход игрока
        """
        game = await self.get_game_by_id(game_command.room_id)
        await game.process_role_action(game_command.actor_id, game_command.target_id)
        await self.save_game(game)

    async def process_vote(self, game_command: WebSocketGameCommand) -> None:
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

    async def delete_game(self, game_id: str):
        self._logger.debug(f"delete_game ({game_id})")
        await self._game_repository.delete_game(game_id)

    async def get_night_action_order_dict(
        self, game: Game
    ) -> dict[RoleEnum, list[Player]]:
        action_order: dict[RoleEnum, list[Player]] = {}
        for player in game.players:
            if not action_order.get(player.role.role_name):
                action_order[RoleEnum(player.role.role_name)] = [player]
            else:
                action_order[RoleEnum(player.role.role_name)] += [player]

        return action_order

    async def get_night_role_action_order(self) -> list[RoleEnum]:
        return [
            RoleEnum.PROSTITUTE,
            RoleEnum.MAFIA_MEMBER,
            RoleEnum.MANIAC,
            RoleEnum.DOCTOR,
            RoleEnum.MAFIA_DON,
            RoleEnum.SHERIFF,
        ]

    async def proceed_next_stage(self, game: Game) -> Game:
        self._logger.debug("proceed_next_stage")
        game.game_stage = await game.get_next_stage()
        if game.game_stage == GameStageEnum.DAY_TALK:
            game.round_count += 1
            self._logger.debug(f"round count incremented {game.round_count}")
        await self.save_game(game)
        return game


GameServiceDep = Annotated[GameService, Depends()]
