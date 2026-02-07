import infrastructure.redis.dependencies as infra_dep
from fastapi import Depends
from infrastructure.redis.repositories.lobby_repository import LobbyRepository


async def get_lobby_repository(redis=Depends(infra_dep.get_redis_client)):
    yield LobbyRepository(redis)