from enums.team import Team
from entities.player import Player
from enums.role_enum import RoleEnum
from entities.roles.role import Role


class Citizen(Role):
    role: RoleEnum.Citizen
    team: Team.CitizenTeam

    def action_on_player(target_player: Player):
        """
        Do nothing
        """
        pass
