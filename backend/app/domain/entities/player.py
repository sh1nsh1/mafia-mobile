import logging
from abc import ABC, abstractmethod
from typing import Self

from domain.enums import RoleEnum, TeamEnum, PlayerStatusEnum
from domain.exceptions import (
    VotedDisabledException,
    PlayerDisabledException,
    VotedUntargetableException,
    PlayerChosenLastNightException,
)
from domain.entities.user import User


logger = logging.getLogger(__name__)


class Player:
    """
    Player is a class that contains in-game condition for a User
    """

    user: User
    role: "Role"
    is_alive: bool
    votes_count: int
    status_list: list[PlayerStatusEnum]

    def __init__(
        self,
        user: User,
        role: "Role",
        status_list: list[PlayerStatusEnum],
        is_alive=True,
        votes_count=0,
    ):
        self.user = user
        self.role = role
        self.status_list = status_list
        self.is_alive = is_alive
        self.votes_count = int(votes_count)

    def perform_role_action(self, target_player: Self) -> bool | None:
        logger.debug(f"{self.user.username} perform_role_action")
        result = None
        if self.is_disabled():
            self.add_status(PlayerStatusEnum.ACTED)
            raise PlayerDisabledException()

        if self.is_alive and target_player.is_alive:
            if PlayerStatusEnum.ACTED in self.status_list:
                result = self.role.perform_action(target_player, alt_mode=True)
            result = self.role.perform_action(target_player)

        if isinstance(result, bool):
            return result
        self.add_status(PlayerStatusEnum.ACTED)

    def set_vote(self, target_player: Self):
        logger.debug(f"{self.user.username} set_vote")
        if self.is_disabled():
            raise PlayerDisabledException()

        if target_player.is_disabled() or not target_player.is_alive:
            raise VotedDisabledException()

        if PlayerStatusEnum.UNTARGETABLE in target_player.status_list:
            raise VotedUntargetableException()

        target_player.votes_count += 1

    def is_disabled(self):
        return PlayerStatusEnum.DISABLED in self.status_list

    def die(self):
        logger.debug(f"{self.user.username} die")
        self.is_alive = False

    def add_status(self, status: PlayerStatusEnum):
        logger.debug(f"{self.user.username} add_status")
        self.status_list.append(status)


class Role(ABC):
    """
    Abstract class for all roles in the game
    """

    role_name: RoleEnum
    team: TeamEnum

    @abstractmethod
    def perform_action(
        self, target_player: Player, alt_mode: bool = False
    ) -> bool | None:
        pass


class Citizen(Role):
    """
    Inactive at night
    """

    role_name: RoleEnum = RoleEnum.CITIZEN
    team: TeamEnum = TeamEnum.CITIZEN_TEAM

    def perform_action(
        self, target_player: Player, alt_mode: bool = False
    ) -> bool | None:
        pass


class Doctor(Role):
    """
    Saves players from death
    """

    role_name: RoleEnum = RoleEnum.DOCTOR
    team: TeamEnum = TeamEnum.CITIZEN_TEAM

    def perform_action(
        self, target_player: Player, alt_mode: bool = False
    ) -> bool | None:
        logger.debug(f"{self.role_name} perform_action")
        """
        Prevent target player from dying
        """
        if PlayerStatusEnum.HEALED_PREV in target_player.status_list:
            raise PlayerChosenLastNightException()

        target_player.add_status(PlayerStatusEnum.HEALED)


class MafiaMember(Role):
    """
    Raids players at night
    """

    role_name: RoleEnum = RoleEnum.MAFIA_MEMBER
    team: TeamEnum = TeamEnum.MAFIA_TEAM

    def perform_action(
        self, target_player: Player, alt_mode: bool = False
    ) -> bool | None:
        """
        Kill a target player
        """
        logger.debug(f"{self.role_name} perform_action")
        target_player.add_status(PlayerStatusEnum.RAIDED)


class MafiaDon(MafiaMember, Role):
    """
    Looks for the Sheriff and raids with Mafia Members
    """

    role_name: RoleEnum = RoleEnum.MAFIA_DON
    team: TeamEnum = TeamEnum.MAFIA_TEAM

    def perform_action(
        self, target_player: Player, alt_mode: bool = False
    ) -> bool | None:
        logger.debug(f"{self.role_name} perform_action")

        if alt_mode:
            return target_player.role.role_name == RoleEnum.SHERIFF

        return super().perform_action(target_player)


class Sheriff(Role):
    """
    Looks for the Mafia Members
    """

    role_name: RoleEnum = RoleEnum.SHERIFF
    team: TeamEnum = TeamEnum.CITIZEN_TEAM

    def perform_action(self, target_player: Player, alt_mode=False) -> bool | None:
        """
        Get information whether target_player is from Mafia team
        """
        logger.debug(f"{self.role_name} perform_action")

        return target_player.role.team == TeamEnum.MAFIA_TEAM


class Prostitute(Role):
    role_name: RoleEnum = RoleEnum.PROSTITUTE
    team: TeamEnum = TeamEnum.CITIZEN_TEAM

    def perform_action(
        self, target_player: Player, alt_mode: bool = False
    ) -> bool | None:
        """
        Prevent target player from dying
        """
        logger.debug(f"{self.role_name} perform_action")

        if PlayerStatusEnum.DISABLED_PREV in target_player.status_list:
            raise PlayerChosenLastNightException()

        target_player.add_status(PlayerStatusEnum.DISABLED)


class Maniac(Role):
    role_name: RoleEnum = RoleEnum.MANIAC
    team: TeamEnum = TeamEnum.NEUTRAL

    def perform_action(
        self, target_player: Player, alt_mode: bool = False
    ) -> bool | None:
        """
        Prevent target player from dying
        """
        logger.debug(f"{self.role_name} perform_action")

        target_player.add_status(PlayerStatusEnum.ASSAULTED)
