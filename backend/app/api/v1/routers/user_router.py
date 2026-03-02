from typing import Annotated

from fastapi import Depends, HTTPException
from sqlalchemy.exc import DatabaseError
from fastapi.routing import APIRouter
from fastapi.security import OAuth2PasswordRequestForm
from domain.exceptions import UserNotFoundException
from api.v1.dependencies import get_current_user
from api.v1.dtos.token_pair_dto import TokenPairDTO
from api.v1.dtos.user_create_dto import UserCreateDTO
from api.v1.dtos.current_user_dto import CurrentUserDTO
from api.v1.dtos.refresh_token_dto import RefreshTokenDTO
from api.v1.dtos.user_create_response import UserCreateResponse
from application.services.user_service import UserService
from application.queries.user_auth_query import UserAuthQuery
from application.services.security_service import SecurityAService
from application.commands.user_create_command import UserCreateCommand


user_router = APIRouter(prefix="/user", tags=["user"])


@user_router.post("/login")
async def login(
    form_data: Annotated[OAuth2PasswordRequestForm, Depends()],
    security_service: Annotated[SecurityAService, Depends()],
) -> TokenPairDTO:
    query = UserAuthQuery(form_data.username, form_data.password)
    try:
        token_pair = await security_service.login(query)
        return token_pair
    except Exception as e:
        raise HTTPException(401, e.args)


@user_router.post("/register")
async def register(
    request: UserCreateDTO,
    security_service: Annotated[SecurityAService, Depends()],
) -> UserCreateResponse:
    user_command = UserCreateCommand(request.username, request.email, request.password)
    try:
        result = await security_service.register_user(user_command)
        return result
    except DatabaseError:
        raise HTTPException(403, "Username already exists")


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
    user_service: Annotated[UserService, Depends()],
):
    result = await user_service.get_user_joined_lobby(current_user.id)
    return result


@user_router.get("/me")
async def get_me(
    current_user: Annotated[CurrentUserDTO, Depends(get_current_user)],
    user_service: Annotated[UserService, Depends()],
):
    try:
        result = await user_service.get_me(current_user.id)
        return result
    except UserNotFoundException as e:
        raise HTTPException(404, e)
