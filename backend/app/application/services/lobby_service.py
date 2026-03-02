import logging
from uuid import UUID
from typing import Annotated

from fastapi import Depends, HTTPException, status
from domain.services.lobby_service import LobbyDService
from api.v1.dtos.lobby_response_model import LobbyResponseDTO
from application.commands.lobby_join_command import LobbyJoinCommand
from application.commands.lobby_leave_command import LobbyLeaveCommand
from application.commands.lobby_create_command import LobbyCreateCommand
from infrastructure.redis.repositories.lobby_repository import LobbyRepository


class LobbyAService:
    _repository: LobbyRepository
    _lobby_domain_service: LobbyDService

    def __init__(
        self,
        lobby_domain_service: Annotated[LobbyDService, Depends()],
        repository: Annotated[LobbyRepository, Depends()],
    ):
        self._lobby_domain_service = lobby_domain_service
        self._repository = repository
        self.logger = logging.getLogger(self.__class__.__name__)

    async def create_lobby(self, command: LobbyCreateCommand):
        self.logger.debug("LobbyAService.create_lobby")
        try:
            lobby = await self._repository.create_lobby(
                command.admin_id, command.max_players
            )
            self.logger.info(f"User {lobby.admin.id} подключен к лобби {lobby.id}")
            return LobbyResponseDTO(
                status="OK",
                lobby_id=lobby.id,
                admin_id=lobby.admin.id,
                max_players=lobby.max_players,
                participants=[user.id for user in lobby.participants],
            )
        except Exception as e:
            raise HTTPException(status.HTTP_405_METHOD_NOT_ALLOWED, e.args)

    # async def join_lobby(self, lobby_id: str, user_id: int):
    async def join_lobby(self, command: LobbyJoinCommand):
        success = await self._repository.add_participant(
            command.lobby_id, command.user_id
        )
        self.logger.debug("LobbyAService.join_lobby")
        self.logger.info(f"User {command.user_id} подключен к лобби {command.lobby_id}")
        return success

    async def get_lobby(self, lobby_id: str):
        lobby = await self._repository.get_lobby_by_id(lobby_id)
        print("LobbyAService.get_lobby")
        if lobby:
            return LobbyResponseDTO(
                status="OK",
                lobby_id=lobby.id,
                admin_id=lobby.admin.id,
                max_players=lobby.max_players,
                participants=[user.id for user in lobby.participants],
            )
        else:
            raise HTTPException(404, "Lobby not found")

    async def leave_lobby(self, command: LobbyLeaveCommand):
        self.logger.debug("leave_lobby")
        await self._repository.remove_participant(command.lobby_id, command.user_id)
