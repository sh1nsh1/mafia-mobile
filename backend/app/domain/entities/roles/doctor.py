from enums.role_enum import RoleEnum
from enums.team import Team
from entities.roles.role import Role
from entities.player import Player

class Doctor(Role):
    role: RoleEnum.Doctor
    team: Team.CitizenTeam

    def action_on_player(target_player:"Player"):
        """
        Prevent target player from dying
        """
        target_player.is_alive = True