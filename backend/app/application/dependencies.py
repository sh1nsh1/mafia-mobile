from typing import Annotated
from functools import lru_cache

from fastapi import Depends, Request, WebSocket

from application.services.game_service import GameServiceDep
from application.services.game_manager_service import GameManagerService
from application.services.notification_service import NotificationSeviceDep


@lru_cache
def get_game_manager(
    request: WebSocket,
    game_service: GameServiceDep,
    notification_service: NotificationSeviceDep,
) -> GameManagerService:

    if not hasattr(request.app.state, "game_manager"):
        game_manager = GameManagerService(game_service, notification_service)
        request.app.state.game_manager = game_manager

    return request.app.state.game_manager


GameManagerDep = Annotated[GameManagerService, Depends(get_game_manager)]
