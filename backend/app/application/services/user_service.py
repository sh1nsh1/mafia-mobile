import logging
from uuid import UUID
from typing import Annotated

from fastapi import Depends

from domain.exceptions import UserNotFoundException
from presentation.api.v1.dtos.requests.user_dto import UserDTO
from infrastructure.redis.repositories.lobby_repository import LobbyRepositoryDep
from infrastructure.database.repositories.user_repository import UserRepositoryDep
from presentation.api.v1.dtos.responses.lobby_response_model import (
    LobbyResponseDTO,
)


class UserService:
    def __init__(
        self,
        user_repository: UserRepositoryDep,
        lobby_repository: LobbyRepositoryDep,
    ):
        self._logger = logging.getLogger(self.__class__.__name__)
        self._user_repository = user_repository
        self._lobby_repostiry = lobby_repository

    async def get_user_joined_lobby(self, user_id: UUID):
        self._logger.debug("get_user_joined_lobby")
        lobby = await self._lobby_repostiry.get_user_active_lobby(user_id)
        self._logger.debug(lobby)
        return LobbyResponseDTO(
            status="OK",
            lobby_id=lobby.id if lobby else None,
            admin_id=lobby.admin.id if lobby else None,
            max_players=lobby.max_players if lobby else None,
            participants=[user.id for user in lobby.participants] if lobby else [],
        )

    async def get_me(self, user_id: UUID) -> UserDTO:
        self._logger.debug("get_me")

        user = await self._user_repository.get_user_by_id(user_id)

        if not user:
            raise UserNotFoundException(user_id=str(user_id))

        return UserDTO(username=user.username, email=user.email)


UserServiceDep = Annotated[UserService, Depends()]
