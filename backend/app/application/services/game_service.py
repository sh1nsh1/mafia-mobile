from infrastructure.redis.repositories.game_repository import GameRepositoryDep


class GameService:
    def __init__(self, game_repository: GameRepositoryDep):
        self._game_repository = game_repository
