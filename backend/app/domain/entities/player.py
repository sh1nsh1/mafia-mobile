import logging
from abc import ABC, abstractmethod
from typing import Self

from domain.enums import RoleEnum, TeamEnum, PlayerStatusEnum
from domain.exceptions import (
    PlayerDisabledException,
    PlayerChosenTwiceException,
    VotedUntargetableException,
    VotedDisabledTargetException,
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

    def __getitem__(self, status: str | PlayerStatusEnum):
        return self.status_list.count(PlayerStatusEnum(status))

    def __iadd__(self, status: str | PlayerStatusEnum):
        self.status_list.append(PlayerStatusEnum(status))
        return self

    def __str__(self):
        return (
            f"{self.user.username} ({self.role.role_name.value}) {str(self.user.id)}\n{'=' * 80}\n\t"
            f"alive: {self.is_alive}\n\tvotes: {self.votes_count}\n\t"
            f"statuses: {', '.join(self.status_list)}"
        )

    def perform_role_action(self, target_player: Self) -> bool | None:
        logger.debug(f"{self.user.username} perform_role_action")
        actionresult = None
        if self[PlayerStatusEnum.DISABLED]:
            logger.debug(f"{self.user.username} disabled - skip")
            self += PlayerStatusEnum.ACTED
            raise PlayerDisabledException()

        if self.is_alive and target_player.is_alive:
            if self[PlayerStatusEnum.ACTED]:
                actionresult = self.role.perform_action(target_player, alt_mode=True)
            actionresult = self.role.perform_action(target_player)

        self += PlayerStatusEnum.ACTED

        if isinstance(actionresult, bool):
            return actionresult

    def set_vote(self, target_player: Self):
        logger.debug(f"{self.user.username} set_vote {target_player.user.username}")
        if self[PlayerStatusEnum.DISABLED_PREV]:
            logger.debug(f"{self.user.username} cannot vote - self disabled")
            raise PlayerDisabledException()

        if target_player[PlayerStatusEnum.DISABLED_PREV] or not target_player.is_alive:
            logger.debug(f"{self.user.username} cannot vote - target disabled")
            raise VotedDisabledTargetException()

        if target_player[PlayerStatusEnum.UNTARGETABLE]:
            logger.debug(f"{self.user.username} cannot vote - target untargetable")
            raise VotedUntargetableException()

        target_player.votes_count += 1

    def die(self):
        logger.debug(f"{self.user.username} died")
        self.is_alive = False


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
        logger.debug(
            f"{self.role_name} perform_action on {target_player.user.username}"
        )
        """
        Prevent target player from dying
        """
        if target_player[PlayerStatusEnum.HEALED_PREV]:
            raise PlayerChosenTwiceException()

        target_player += PlayerStatusEnum.HEALED


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
        logger.debug(
            f"{self.role_name} perform_action on {target_player.user.username}"
        )
        target_player += PlayerStatusEnum.RAIDED


class MafiaDon(MafiaMember, Role):
    """
    Looks for the Sheriff and raids with Mafia Members
    """

    role_name: RoleEnum = RoleEnum.MAFIA_DON
    team: TeamEnum = TeamEnum.MAFIA_TEAM

    def perform_action(
        self, target_player: Player, alt_mode: bool = False
    ) -> bool | None:
        logger.debug(
            f"{self.role_name} perform_action on {target_player.user.username}"
        )

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
        logger.debug(
            f"{self.role_name} perform_action on {target_player.user.username}"
        )

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
        logger.debug(
            f"{self.role_name} perform_action on {target_player.user.username}"
        )

        if target_player[PlayerStatusEnum.DISABLED_PREV]:
            raise PlayerChosenTwiceException()

        target_player += PlayerStatusEnum.DISABLED


class Maniac(Role):
    role_name: RoleEnum = RoleEnum.MANIAC
    team: TeamEnum = TeamEnum.NEUTRAL

    def perform_action(
        self, target_player: Player, alt_mode: bool = False
    ) -> bool | None:
        """
        Prevent target player from dying
        """
        logger.debug(
            f"{self.role_name} perform_action on {target_player.user.username}"
        )

        target_player += PlayerStatusEnum.ASSAULTED
