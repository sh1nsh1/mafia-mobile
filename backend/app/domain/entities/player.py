from entities.role import Role
from entities.user import User


class Player:
    """
    Player is a class that contains in-game condition for a User
    """

    user: User
    role: Role
    is_alive: bool
    votes_count: int

    def perform_action(self, target_player: "Player"):
        if target_player.is_alive:
            self.role.perform_action(target_player)

    def set_vote(self, target_player: "Player"):
        if target_player.is_alive:
            target_player.votes_count += 1
