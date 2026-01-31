from enums.role_enum import RoleEnum
from enums.team import Team
from entities.roles.role import Role
from entities.player import Player

class Citizen(Role):
    role: RoleEnum.Citizen
    team: Team.CitizenTeam

    def action_on_player(target_player:Player):
        """
        Do nothing
        """
        pass
