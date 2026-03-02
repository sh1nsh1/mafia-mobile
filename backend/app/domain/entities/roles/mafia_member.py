from enums.team import Team
from entities.player import Player
from enums.role_enum import RoleEnum
from entities.roles.role import Role


class MafiaMember(Role):
    role: RoleEnum.MafiaMember
    team: Team.CitizenTeam

    def action_on_player(target_player: Player):
        """
        Kill a target player
        """
        target_player.is_alive = False
