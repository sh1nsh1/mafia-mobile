from typing import Annotated
from functools import lru_cache

from fastapi import Depends, WebSocket

from application.services.game_service import GameServiceDep
from application.services.game_manager_service import GameManagerService
from infrastructure.websocket.websocket_manager import WebSocketManagerDep


@lru_cache
def get_game_manager(
    request: WebSocket,
    game_service: GameServiceDep,
    websocket_manager: WebSocketManagerDep,
) -> GameManagerService:

    if not hasattr(request.app.state, "game_manager"):
        game_manager = GameManagerService(game_service, websocket_manager)
        request.app.state.game_manager = game_manager

    return request.app.state.game_manager


GameManagerDep = Annotated[GameManagerService, Depends(get_game_manager)]
