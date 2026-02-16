class GameAService:
    def __init__(self, game_repository: ):
        self._repository = game_repository

    async def start_game(self):
        await self._repository.start_game()
