from domain.services.lobby_service import LobbyDService
from infrastructure.redis.models.lobby_model import LobbyModel
from infrastructure.redis.repositories.lobby_repository import LobbyRepository


class LobbyAService:
    _repository: LobbyRepository
    _lobby_domain_service: LobbyDService

    def __init__(
        self, lobby_domain_service: LobbyDService, repository: LobbyRepository
    ):
        self._lobby_domain_service = lobby_domain_service
        self._repository = repository

    async def create_lobby(self, admin_id: str, max_players: int) -> LobbyModel:
        lobby_model: LobbyModel = await self._repository.create_lobby(admin_id, max_players)
        print("LobbyAService.create_lobby")
        #TODO подключить юзера к вебсокету
        print(f"User {admin_id} подключен к лобби {lobby_model.id} по WebSocket")
        return lobby_model