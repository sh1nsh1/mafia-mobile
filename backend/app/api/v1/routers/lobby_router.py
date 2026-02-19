from typing import Annotated

import api.v1.dependencies as api_dep
from fastapi import Depends
from fastapi import HTTPException
from fastapi.routing import APIRouter
from domain.exceptions import DomainException
from core.services.lobby_service import LobbyAService

from api.v1.response_models import lobby_response_model as responses


lobby_router = APIRouter(prefix="/lobby")


@lobby_router.post("/")
async def create_lobby(
    admin_id: str,
    max_players: int,
    lobby_aservice: Annotated[LobbyAService, Depends()],
):
    lobby = await lobby_aservice.create_lobby(admin_id, max_players)

    return responses.LobbyCreateResponse(
        status="OK",
        message="Lobby successfuly created",
        lobby_id=lobby.id,
        admin_id=lobby.admin_id,
        max_players=lobby.max_players,
    )


@lobby_router.get("/{lobby_id}/")
async def get_lobby_by_id(
    lobby_id: str,
    lobby_service: Annotated[LobbyAService, Depends()],
):
    result = await lobby_service.get_lobby(lobby_id)
    return result


@lobby_router.post("/{lobby_id}/join")
async def join_lobby(
    lobby_id: str,
    user_id: str,
    lobby_service: Annotated[LobbyAService, Depends()],
):
    try:
        await lobby_service.join_lobby(lobby_id, user_id)
        return responses.LobbyJoinResponse(
            "OK", "Lobby successfuly joined", lobby_id
        )

    except DomainException as e:
        raise HTTPException(405, e.message)


@lobby_router.post("/{lobby_id}/leave")
async def leave_lobby(
    lobby_id: str,
    user_id: str,
    lobby_service: Annotated[LobbyAService, Depends()],
):
    try:
        await lobby_service.leave_lobby(lobby_id, user_id)
        return responses.LobbyLeaveResponse(
            "OK", "User successfuly left the lobby", lobby_id
        )
    except DomainException as e:
        raise HTTPException(405, e.message)
