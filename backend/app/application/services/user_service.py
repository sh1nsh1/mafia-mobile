import logging
from uuid import UUID
from typing import Annotated

from fastapi import Depends, UploadFile

from presentation.api.v1.dtos.responses.room_response import RoomResponse
from infrastructure.redis.repositories.game_repository import GameRepositoryDep
from infrastructure.redis.repositories.lobby_repository import LobbyRepositoryDep
from infrastructure.database.repositories.user_repository import UserRepositoryDep
from infrastructure.database.repositories.avatar_repository import AvatarRepositoryDep


class UserService:
    def __init__(
        self,
        user_repository: UserRepositoryDep,
        lobby_repository: LobbyRepositoryDep,
        game_repository: GameRepositoryDep,
        avatar_repository: AvatarRepositoryDep,
    ):
        self._logger = logging.getLogger(self.__class__.__name__)
        self._user_repository = user_repository
        self._lobby_repostiry = lobby_repository
        self._game_repository = game_repository
        self._avatar_repository = avatar_repository

    async def get_user_joined_room(self, user_id: UUID) -> RoomResponse | None:
        self._logger.debug("get_user_joined_room")
        room_id = await self._lobby_repostiry.get_user_active_room_id(user_id)
        if not room_id:
            return None
        lobby = await self._lobby_repostiry.get_lobby_by_id(room_id)

        return RoomResponse(room_id=room_id, is_lobby=bool(lobby))

    async def get_user_avatar(self, user_id: UUID) -> bytes | None:
        self._logger.debug("get_user_avatar")
        avatar = await self._avatar_repository.get_avatar_file(user_id)
        return avatar

    async def set_user_avatar(self, user_id: UUID, file: UploadFile):
        self._logger.debug("set_user_avatar")
        return await self._avatar_repository.upload_avatar(user_id, file)


UserServiceDep = Annotated[UserService, Depends()]
