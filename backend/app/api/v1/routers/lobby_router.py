from typing import Annotated

from fastapi import Depends
from fastapi import HTTPException
from api.v1.dtos import lobby_response_model as responses
from fastapi.routing import APIRouter
from domain.exceptions import DomainException
from api.v1.dependencies import get_current_user
from api.v1.dtos.current_user_dto import CurrentUserDTO
from api.v1.dtos.lobby_create_dto import LobbyCreateDTO
from application.services.lobby_service import LobbyAService
from application.commands.lobby_join_command import LobbyJoinCommand
from application.commands.lobby_leave_command import LobbyLeaveCommand
from application.commands.lobby_create_command import LobbyCreateCommand


lobby_router = APIRouter(prefix="/lobby", tags=["lobby"])


@lobby_router.post("/")
async def create_lobby(
    req: LobbyCreateDTO,
    lobby_service: Annotated[LobbyAService, Depends()],
    current_user: Annotated[CurrentUserDTO, Depends(get_current_user)],
):
    lobby_command = LobbyCreateCommand(req.max_players, current_user.id)

    result = await lobby_service.create_lobby(lobby_command)
    return result


@lobby_router.get("/{lobby_id}/")
async def get_lobby_by_id(
    lobby_id: str,
    current_user: Annotated[CurrentUserDTO, Depends(get_current_user)],
    lobby_service: Annotated[LobbyAService, Depends()],
):
    result = await lobby_service.get_lobby(lobby_id)
    return result


@lobby_router.post("/{lobby_id}/join")
async def join_lobby(
    lobby_id: str,
    current_user: Annotated[CurrentUserDTO, Depends(get_current_user)],
    lobby_service: Annotated[LobbyAService, Depends()],
):
    command = LobbyJoinCommand(lobby_id, current_user.id)
    try:
        await lobby_service.join_lobby(command)
        return responses.LobbyJoinResponse(
            status="OK", message="Lobby successfuly joined", lobby_id=lobby_id
        )

    except DomainException as e:
        raise HTTPException(405, e.message)


@lobby_router.post("/{lobby_id}/leave")
async def leave_lobby(
    lobby_id: str,
    current_user: Annotated[CurrentUserDTO, Depends(get_current_user)],
    lobby_service: Annotated[LobbyAService, Depends()],
):
    command = LobbyLeaveCommand(lobby_id=lobby_id, user_id=current_user.id)

    try:
        await lobby_service.leave_lobby(command)
        return responses.LobbyLeaveResponse(
            status="OK",
            message="User successfuly left the lobby",
            lobby_id=lobby_id,
        )
    except DomainException as e:
        raise HTTPException(405, e.message)
