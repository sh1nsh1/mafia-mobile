import core.services.dependencies as core_dep
from core.services.lobby_service import LobbyAService
from domain.services.lobby_service import LobbyDService
from fastapi import Depends


async def get_lobby_aservice(
    repostory = Depends(core_dep.get_lobby_repository)
) -> LobbyAService:
    lobby_dservice = LobbyDService()

    yield LobbyAService(
        lobby_dservice,
        repostory
    )