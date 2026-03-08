import logging

from fastapi import HTTPException
from sqlalchemy.exc import DatabaseError
from fastapi.routing import APIRouter

from domain.exceptions import UserNotFoundException
from application.services.user_service import UserServiceDep
from application.queries.user_auth_query import UserAuthQuery
from application.services.security_service import SecurityServiceDep
from presentation.api.v1.dependencies.alias import (
    FormDataDep,
    CurrentUserDep,
)
from application.commands.user_create_command import UserCreateCommand
from presentation.api.v1.dtos.requests.user_create_dto import UserCreateDTO
from presentation.api.v1.dtos.responses.token_pair_dto import TokenPairDTO
from presentation.api.v1.dtos.requests.refresh_token_dto import RefreshTokenDTO
from presentation.api.v1.dtos.responses.user_create_response import (
    UserCreateResponse,
)


logger = logging.getLogger(__name__)
user_router = APIRouter(prefix="/user", tags=["user"])


@user_router.post("/login")
async def login(
    form_data: FormDataDep,
    security_service: SecurityServiceDep,
) -> TokenPairDTO:
    logger.debug("/login")
    query = UserAuthQuery(form_data.username, form_data.password)
    try:
        token_pair = await security_service.login(query)
        return token_pair
    except Exception as e:
        raise HTTPException(401, e.args)


@user_router.post("/register")
async def register(
    request: UserCreateDTO,
    security_service: SecurityServiceDep,
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
    security_service: SecurityServiceDep,
):
    try:
        result = await security_service.refresh_token(request.refresh_token)
        return result
    except Exception:
        raise HTTPException(403, "Username already exists")


@user_router.get("/lobby")
async def get_current_lobby(
    current_user: CurrentUserDep,
    user_service: UserServiceDep,
):
    result = await user_service.get_user_joined_lobby(current_user.id)
    return result


@user_router.get("/me")
async def get_me(
    current_user: CurrentUserDep,
    user_service: UserServiceDep,
):
    try:
        result = await user_service.get_me(current_user.id)
        return result
    except UserNotFoundException as e:
        raise HTTPException(404, e)
