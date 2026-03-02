from typing import Annotated

from fastapi import Depends
from fastapi import HTTPException
from fastapi.routing import APIRouter
from fastapi.security import OAuth2PasswordRequestForm
from api.v1.dependencies import get_current_user
from api.v1.dtos.current_user_dto import CurrentUserDTO
from api.v1.dtos.refresh_token_dto import RefreshTokenDTO
from application.services.lobby_service import LobbyAService
from application.queries.user_auth_query import UserAuthQuery
from application.services.security_service import SecurityAService


user_router = APIRouter(prefix="/user", tags=["user"])


@user_router.post("/login")
async def login(
    form_data: Annotated[OAuth2PasswordRequestForm, Depends()],
    security_service: Annotated[SecurityAService, Depends()],
):
    user_credentials = UserAuthQuery(form_data.username, form_data.password)
    try:
        token_pair = await security_service.login(user_credentials)
        return token_pair
    except Exception as e:
        raise HTTPException(401, e.args)


@user_router.post("/register")
async def register(
    form_data: Annotated[OAuth2PasswordRequestForm, Depends()],
    security_service: Annotated[SecurityAService, Depends()],
):
    user_credentials = UserAuthQuery(form_data.username, form_data.password)
    try:
        token_pair = await security_service.login(user_credentials)
        return token_pair
    except Exception as e:
        raise HTTPException(401, e.args)


@user_router.post("/refresh")
async def refresh(
    request: RefreshTokenDTO,
    security_service: Annotated[SecurityAService, Depends()],
):
    try:
        result = await security_service.refresh_token(request.refresh_token)
        return result
    except Exception:
        raise HTTPException(403, "Username already exists")


@user_router.get("/lobby")
async def get_current_lobby(
    current_user: Annotated[CurrentUserDTO, Depends(get_current_user)],
    lobby_service: Annotated[LobbyAService, Depends()],
):
    result = await lobby_service.get_user_joined_lobby(current_user.id)
    return result
