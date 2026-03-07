from typing import Annotated

from fastapi import Depends, WebSocket
from fastapi.security import (
    HTTPBearer,
    HTTPAuthorizationCredentials,
)

from application.dependenices.alias import SecurityServiceDep
from application.services.security_service import SecurityService


async def get_current_user(
    bearer_scheme: Annotated[
        HTTPAuthorizationCredentials, Depends(HTTPBearer())
    ],
    security_service: SecurityServiceDep,
):
    return await security_service.get_current_user(bearer_scheme.credentials)


async def get_current_user_ws(
    websocket: WebSocket,
    security_service: Annotated[SecurityService, Depends()],
):
    auth_type, access_token = websocket.headers["Authorization"].split()
    if auth_type != "Bearer":
        raise ValueError()
    print(auth_type, access_token)
    return await security_service.get_current_user(access_token)
