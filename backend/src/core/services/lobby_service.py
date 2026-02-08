from ssl import PROTOCOL_TLS_CLIENT

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
        # TODO подключить юзера к вебсокету
        print(f"User {admin_id} подключен к лобби {lobby_model.id} по WebSocket")
        return lobby_model

    async def join_lobby(self, lobby_id: str, user_id: str):
        success = await self._repository.add_participant(lobby_id, user_id)
        print("LobbyAService.join_lobby")
        # TODO подключить юзера к вебсокету
        print(f"User {user_id} подключен к лобби {lobby_id} по WebSocket")
        return success

    async def get_lobby(self, lobby_id: str):
        lobby = await self._repository.get_lobby(lobby_id)
        print("LobbyAService.get_lobby")
        return lobby

    async def leave_lobby(self, lobby_id: str, user_id: str):
        success = await self._repository.remove_participant(lobby_id, user_id)
        print("LobbyAService.leave_lobby")
        # TODO отключить юзера от вебсокета
        print(f"User {user_id} отключён от WebSocket лобби {lobby_id}")
        return success
