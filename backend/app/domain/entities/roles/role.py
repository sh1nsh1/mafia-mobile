from abc import ABC, abstractmethod

from enums import RoleEnum, TeamEnum
from entities.player import Player


class Role(ABC):
    """
    Abstract class for all roles in the game
    """

    role_name: RoleEnum
    team: TeamEnum

    @abstractmethod
    def perform_action(target_player: Player):
        pass
