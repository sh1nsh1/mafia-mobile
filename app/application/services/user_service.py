from uuid import UUID

from dishka import FromDishka
from fastapi import UploadFile

from infrastructure.logger import get_logger
from infrastructure.redis.repositories import GameRepository, LobbyRepository
from infrastructure.database.repositories import UserRepository, AvatarRepository
from presentation.api.v1.dtos.responses.room_response import RoomResponse


logger = get_logger(f"{__name__}.UserService", 20)

class UserService:

    def __init__(
        self,
        user_repository: FromDishka[UserRepository],
        lobby_repository: FromDishka[LobbyRepository],
        game_repository: FromDishka[GameRepository],
        # avatar_repository: FromDishka[AvatarRepository],
    ):
        self._user_repository = user_repository
        self._lobby_repostiry = lobby_repository
        self._game_repository = game_repository
        # self._avatar_repository = avatar_repository

    async def get_user_joined_room(self, user_id: UUID) -> RoomResponse | None:
        logger.debug("get_user_joined_room")
        room_id = await self._lobby_repostiry.get_user_active_room_id(user_id)
        if not room_id:
            return None
        lobby = await self._lobby_repostiry.get_lobby_by_id(room_id)

        return RoomResponse(room_id=room_id, is_lobby=bool(lobby))

    async def get_user_avatar(self, user_id: UUID) -> bytes | None:
        ...
    #     logger.debug("get_user_avatar")
    #     avatar = await self._avatar_repository.get_avatar_file(user_id)
    #     return avatar

    async def set_user_avatar(self, user_id: UUID, file: UploadFile):
        ...
    #     logger.debug("set_user_avatar")
    #     return await self._avatar_repository.upload_avatar(user_id, file)
