from uuid import UUID
from datetime import datetime

from domain.enums import (
    RoleEnum,
    TeamEnum,
    GameStageEnum,
    GameStatusEnum,
    PlayerStatusEnum,
)
from domain.exceptions import DomainException
from domain.entities.user import User
from domain.entities.player import Player


class Game:
    id: str
    players: list[Player]
    admin: User

    start_date: datetime

    winner_team: TeamEnum | None
    game_status: GameStatusEnum
    game_stage: GameStageEnum
    finish_date: datetime | None
    round_count: int

    def __init__(
        self,
        id: str,
        players: list[Player],
        admin: User,
        start_date: datetime | None = None,
        winner_team: TeamEnum | None = None,
        game_status: GameStatusEnum = GameStatusEnum.IN_PROGRESS,
        game_stage: GameStageEnum = GameStageEnum.DAY_INTRO,
        finish_date: datetime | None = None,
        round_count: int = 0,
    ):
        self.id = id
        self.players = players
        self.admin = admin

        self.start_date = start_date or datetime.now()
        self.winner_team = winner_team or TeamEnum.NONE
        self.game_status = game_status
        self.game_stage = game_stage
        self.finish_date = finish_date
        self.round_count = round_count

    async def check_finish_condition(self) -> bool:
        player_count = len(self.players)
        maniac = await self._is_maniac_alive()
        mafia_number = await self._get_alive_mafia_number()

        if mafia_number == 0 and not maniac:
            self.winner_team = TeamEnum.CITIZEN_TEAM
            return True
        elif mafia_number >= player_count - mafia_number:
            self.winner_team = TeamEnum.MAFIA_TEAM
            return True
        elif maniac and player_count == 1:
            self.winner_team = TeamEnum.NEUTRAL
            return True
        else:
            return False

    async def process_role_action(self, actor_id: UUID, target_id: UUID):
        actor = None
        target = None

        for player in self.players:
            if player.user.id == actor_id:
                actor = player
            if player.user.id == target_id:
                target = player
            if actor and target:
                break

        if not (actor and target):
            raise DomainException(f"Actor or Target not found in game {self.id}")

        await actor.perform_role_action(target)

    async def process_vote(self, actor_id: UUID, target_id: UUID):
        actor = None
        target = None

        for player in self.players:
            if player.user.id == actor_id:
                actor = player
            if player.user.id == target_id:
                target = player
            if actor and target:
                break

        if not (actor and target):
            raise DomainException(f"Actor or Target not found in game {self.id}")

        actor.set_vote(target)

    async def resolve_night_stage(self):
        for player in self.players:
            if (
                player.role.role_name == RoleEnum.PROSTITUTE
                and await self._player_can_die(player)
            ):
                disabled_player = await self._get_disabled_player()
                if disabled_player and await self._player_can_die(disabled_player):
                    disabled_player.die()  # prostitute's visitor dies
                player.die()  # prostitute dies

            elif (
                await self._player_can_die(player)
                and PlayerStatusEnum.DISABLED not in player.status_list
            ):
                player.die()  # player dies
            await self.clear_player_statuses(player)

    async def resole_voting_stage(self, players: list[Player] | None = None):
        if not players:
            players = self.players
        max_vote_player = players[0]
        for player in players:
            if player.votes_count > max_vote_player.votes_count:
                max_vote_player = player
        max_vote_player.die()

    async def get_next_stage(self) -> GameStageEnum:
        """
        Переводит игру на следующую стадию и возвращает эту стадию
        """
        match self.game_stage:
            case GameStageEnum.DAY_INTRO:
                self.game_stage = GameStageEnum.NIGHT
            case GameStageEnum.NIGHT:
                self.game_stage = GameStageEnum.DAY_TALK
            case GameStageEnum.DAY_TALK:
                self.game_stage = GameStageEnum.DAY_VOTE
            case GameStageEnum.DAY_VOTE:
                await self.clear_players_votes()
                self.game_stage = GameStageEnum.NIGHT

        return self.game_stage

    async def clear_player_statuses(self, player: Player):
        new_status_list = []
        for status in player.status_list:
            match status:
                case PlayerStatusEnum.HEALED:
                    new_status_list.append(PlayerStatusEnum.HEALED_PREV)
                case PlayerStatusEnum.DISABLED:
                    new_status_list.append(PlayerStatusEnum.DISABLED_PREV)
        player.status_list = new_status_list

    async def clear_players_votes(self):
        for player in self.players:
            player.votes_count = 0

    async def _get_alive_mafia_number(self) -> int:
        mafia_number = 0
        for player in self.players:
            if player.is_alive and player.role.team == TeamEnum.MAFIA_TEAM:
                mafia_number += 1
        return mafia_number

    async def _is_maniac_alive(self) -> bool:
        for player in self.players:
            if player.role.role_name == RoleEnum.MANIAC:
                return True
        return False

    async def _player_can_die(self, player: Player) -> bool:
        if (
            (
                player.status_list.count(PlayerStatusEnum.RAIDED)
                == await self._get_alive_mafia_number()
                or PlayerStatusEnum.ASSAULTED in player.status_list
            )
            and PlayerStatusEnum.HEALED not in player.status_list
            and player.is_alive
        ):
            return True
        return False

    async def _get_disabled_player(self) -> Player | None:
        for player in self.players:
            if PlayerStatusEnum.DISABLED in player.status_list:
                return player

    async def get_unacted_players(self) -> list[Player]:
        unacted_players: list[Player] = []

        for player in self.players:
            if PlayerStatusEnum.ACTED not in player.status_list:
                unacted_players.append(player)

        return unacted_players
