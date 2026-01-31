from enums.role_enum import RoleEnum
from enums.team_enum import TeamEnum
from entities.roles.role import Role
from entities.player import Player

class MafiaMember(Role):
    role: RoleEnum.MafiaMember
    team: TeamEnum.MafiaTeam

    def action_on_player(target_player:Player):
        """
        Get information whether target_player is from Mafia team
        """
        is_mafia = Player.role.Team == TeamEnum.MafiaTeam
        
        # send check result to Player 