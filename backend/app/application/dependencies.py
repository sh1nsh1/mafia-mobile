from typing import Annotated
from functools import lru_cache

from fastapi import Depends

from application.services.game_service import GameServiceDep
from application.services.game_manager_service import GameManager
from application.services.notification_service import NotificationSeviceDep


@lru_cache
def get_game_manager(
    game_service: GameServiceDep, notification_service: NotificationSeviceDep
) -> GameManager:
    return GameManager(game_service, notification_service)


GameManagerDep = Annotated[GameManager, Depends(get_game_manager)]
