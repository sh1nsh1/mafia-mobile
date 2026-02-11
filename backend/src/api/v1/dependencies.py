from collections.abc import AsyncGenerator

from fastapi import Depends

import core.services.dependencies as core_dep
from core.services.lobby_service import LobbyAService
from core.services.lobby_websocket_service import LobbyWebSocketAService
from domain.services.lobby_service import LobbyDService


async def get_lobby_aservice(repostory=Depends(core_dep.get_lobby_repository)) -> AsyncGenerator[LobbyAService]:
    lobby_dservice = LobbyDService()

    yield LobbyAService(lobby_dservice, repostory)


async def get_lobby_websocket_aservice(websocket_manager=Depends(core_dep.get_websocket_manager)):
    yield LobbyWebSocketAService(websocket_manager)
