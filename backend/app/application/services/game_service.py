from typing import Annotated

from fastapi import Depends
from infrastructure.redis.repositories.game_repository import GameRepository


class GameAService:
    def __init__(self, game_repository: Annotated[GameRepository, Depends()]):
        self._repository = game_repository
