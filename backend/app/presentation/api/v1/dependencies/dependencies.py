from typing import Annotated

from fastapi import Depends, WebSocket
from fastapi.security import (
    HTTPBearer,
    HTTPAuthorizationCredentials,
)

from application.services.security_service import (
    SecurityService,
    SecurityServiceDep,
)


async def get_current_user(
    bearer_scheme: Annotated[HTTPAuthorizationCredentials, Depends(HTTPBearer())],
    security_service: SecurityServiceDep,
):
    return await security_service.get_current_user(bearer_scheme.credentials)


async def get_current_user_ws(
    websocket: WebSocket,
    security_service: Annotated[SecurityService, Depends()],
):
    access_token = websocket.query_params["token"]

    print(access_token)
    return await security_service.get_current_user(access_token)
