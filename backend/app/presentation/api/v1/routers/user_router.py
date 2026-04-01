import logging

from fastapi import HTTPException
from sqlalchemy.exc import DatabaseError
from fastapi.routing import APIRouter

from application.services.user_service import UserServiceDep
from application.queries.user_auth_query import UserAuthQuery
from application.services.security_service import SecurityServiceDep
from presentation.api.v1.dependencies.alias import (
    FormDataDep,
    CurrentUserDep,
)
from application.commands.user_create_command import UserCreateCommand
from presentation.api.v1.dtos.requests.user_create import UserCreate
from presentation.api.v1.dtos.requests.refresh_token import RefreshToken
from presentation.api.v1.dtos.responses.room_response import RoomResponse
from presentation.api.v1.dtos.responses.user_response import UserResponse
from presentation.api.v1.dtos.responses.token_pair_dto import TokenPairDTO
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
        raise HTTPException(400, e.args)


@user_router.post("/register")
async def register(
    request: UserCreate,
    security_service: SecurityServiceDep,
) -> UserCreateResponse:
    user_command = UserCreateCommand(request.username, request.email, request.password)
    try:
        result = await security_service.register_user(user_command)
        return result
    except DatabaseError:
        raise HTTPException(405, "Username already exists")


@user_router.post("/refresh")
async def refresh(
    request: RefreshToken,
    security_service: SecurityServiceDep,
):
    try:
        result = await security_service.refresh_token(request.refresh_token)
        return result
    except ValueError as e:
        raise HTTPException(491, e.args)


@user_router.get("/room")
async def get_current_room(
    current_user: CurrentUserDep,
    user_service: UserServiceDep,
) -> RoomResponse | None:
    return await user_service.get_user_joined_room(current_user.id)


@user_router.get("/me")
async def get_me(
    user: CurrentUserDep,
) -> UserResponse:
    user_response = UserResponse(id=user.id, name=user.username, email=user.email)
    print(user_response)
    return user_response


# Сделать
# @user_router.get("/{id}")
# async def get_user_by_id(
#     id: str,
#     current_user: CurrentUserDep,
#     user_service: UserServiceDep,
# ):
#     try:
#         result = await user_service.get_me(current_user.id)
#         return result
#     except UserNotFoundException as e:
#         raise HTTPException(404, e)
