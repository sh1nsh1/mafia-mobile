import api.v1.dependencies as api_dep
from core.services.lobby_service import LobbyAService
from fastapi import Depends
from fastapi.routing import APIRouter

lobby_router = APIRouter(prefix="/lobby")


@lobby_router.post("/")
async def create_lobby(
    admin_id:str,
    max_players:int,
    lobby_aservice: LobbyAService = Depends(api_dep.get_lobby_aservice)
):
    lobby = await lobby_aservice.create_lobby(
        admin_id, 
        max_players, 
        )
    return {
        "status": "OK",
        "lobby_id": lobby.id,
        "max_players": lobby.max_players
    }
