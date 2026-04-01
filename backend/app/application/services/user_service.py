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

    async def get_user_joined_room(self, user_id: UUID) -> RoomResponse | None:
        self._logger.debug("get_user_joined_room")
        room_id = await self._lobby_repostiry.get_user_active_room_id(user_id)
        if not room_id:
            return None
        lobby = await self._lobby_repostiry.get_lobby_by_id(room_id)

        return RoomResponse(room_id=room_id, is_lobby=bool(lobby))


UserServiceDep = Annotated[UserService, Depends()]
