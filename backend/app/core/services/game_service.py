from typing import Annotated

from fastapi import Depends


class GameAService:
    def __init__(self, game_repository: Annotated[GameRepostitory, Depends()]):
        self._repository = game_repository
