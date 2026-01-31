from abc import ABC, abstractmethod
from enums.role_enum import RoleEnum
from enums.team import Team
from entities.player import Player

class Role(ABC):
    role_name: RoleEnum
    team: Team
    
    @abstractmethod
    def perform_action(target_player:Player):
        ...

