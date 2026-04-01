import logging
from typing import Annotated

from fastapi import Depends, HTTPException

from application.commands.lobby_join_command import LobbyJoinCommand
from application.commands.lobby_leave_command import LobbyLeaveCommand
from application.commands.lobby_create_command import LobbyCreateCommand
from presentation.api.v1.dtos.responses.user_response import UserResponse
from infrastructure.redis.repositories.lobby_repository import (
    LobbyRepositoryDep,
)
from presentation.api.v1.dtos.responses.lobby_response_model import (
    LobbyResponse,
)


class LobbyService:
    def __init__(self, repository: LobbyRepositoryDep):
        self._lobby_repository = repository
        self._logger = logging.getLogger(self.__class__.__name__)

    async def create_lobby(self, command: LobbyCreateCommand):
        self._logger.debug("LobbyAService.create_lobby")
        lobby = await self._lobby_repository.create_lobby(
            command.admin_id, command.max_players
        )

        self._logger.info(f"User {lobby.admin.id} подключен к лобби {lobby.id}")

        return LobbyResponse(
            status="OK",
            id=lobby.id,
            admin_id=lobby.admin.id,
            max_players=lobby.max_players,
            participants=[
                UserResponse(id=user.id, name=user.username, email=user.email)
                for user in lobby.participants
            ],
        )

    # async def join_lobby(self, lobby_id: str, user_id: int):
    async def join_lobby(self, command: LobbyJoinCommand):
        updated_lobby = await self._lobby_repository.add_participant(
            command.lobby_id, command.user_id
        )
        self._logger.debug("LobbyAService.join_lobby")
        self._logger.info(
            f"User {command.user_id} подключен к лобби {command.lobby_id}"
        )
        return LobbyResponse(
            status="OK",
            id=updated_lobby.id,
            admin_id=updated_lobby.admin.id,
            max_players=updated_lobby.max_players,
            participants=[
                UserResponse(id=user.id, name=user.username, email=user.email)
                for user in updated_lobby.participants
            ],
        )

    async def get_all(self) -> list[LobbyResponse]:
        lobbies = await self._lobby_repository.get_all()
        responses: list[LobbyResponse] = []
        self._logger.debug(len(lobbies))
        for lobby in lobbies:
            if lobby is None:
                continue

            response = LobbyResponse(
                status="OK",
                id=lobby.id,
                admin_id=lobby.admin.id,
                max_players=lobby.max_players,
                participants=[
                    UserResponse(id=user.id, name=user.username, email=user.email)
                    for user in lobby.participants
                ],
            )

            responses.append(response)

        return responses

    async def get_lobby(self, lobby_id: str):
        lobby = await self._lobby_repository.get_lobby_by_id(lobby_id)
        print("LobbyAService.get_lobby")
        if lobby:
            return LobbyResponse(
                status="OK",
                id=lobby.id,
                admin_id=lobby.admin.id,
                max_players=lobby.max_players,
                participants=[
                    UserResponse(id=user.id, name=user.username, email=user.email)
                    for user in lobby.participants
                ],
            )
        else:
            raise HTTPException(404, "Lobby not found")

    async def leave_lobby(self, command: LobbyLeaveCommand):
        self._logger.debug("leave_lobby")
        await self._lobby_repository.remove_participant(
            command.lobby_id, command.user_id
        )


LobbyServiceDep = Annotated[LobbyService, Depends()]
