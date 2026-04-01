import logging
from uuid import UUID
from typing import Annotated

from fastapi import Depends

from presentation.api.v1.dtos.responses.room_response import RoomResponse
from infrastructure.redis.repositories.game_repository import GameRepositoryDep
from infrastructure.redis.repositories.lobby_repository import LobbyRepositoryDep
from infrastructure.database.repositories.user_repository import UserRepositoryDep


class UserService:
    def __init__(
        self,
        user_repository: UserRepositoryDep,
        lobby_repository: LobbyRepositoryDep,
        game_repository: GameRepositoryDep,
    ):
        self._logger = logging.getLogger(self.__class__.__name__)
        self._user_repository = user_repository
        self._lobby_repostiry = lobby_repository
        self._game_repository = game_repository

    async def get_user_joined_lobby(self, user_id: UUID):
        self._logger.debug("get_user_joined_lobby")
        lobby = await self._lobby_repostiry.get_user_active_lobby(user_id)
        self._logger.debug(lobby)
        return LobbyResponseDTO(
            status="OK",
            lobby_id=lobby.id if lobby else None,
            admin_id=lobby.admin.id if lobby else None,
            max_players=lobby.max_players if lobby else None,
            participants=[
                UserResponse(
                    id=user.id,
                    email=user.email,
                    name=user.username,
                )
                for user in lobby.participants
            ]
            if lobby
            else [],
        )


UserServiceDep = Annotated[UserService, Depends()]
