from enums import RoleEnum, TeamEnum
from entities.player import Player
from entities.roles.role import Role


class MafiaMember(Role):
    role: RoleEnum = RoleEnum.MAFIA_MEMBER
    team: TeamEnum = TeamEnum.MAFIA_TEAM

    def action_on_player(self, target_player: Player):
        """
        Get information whether target_player is from Mafia team
        """

        is_mafia = Player.role.Team == TeamEnum.MAFIA_TEAM

        # send check result to Player
