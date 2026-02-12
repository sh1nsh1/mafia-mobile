from enums.role_enum import RoleEnum
from enums.team import Team
from entities.roles.role import Role
from entities.player import Player

class MafiaMember(Role):
    role: RoleEnum.MafiaMember
    team: Team.CitizenTeam

    def action_on_player(target_player:Player):
        """
        Kill a target player
        """
        target_player.is_alive = False