import logging

from fastapi import Response, UploadFile, HTTPException, status
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


@user_router.get("/avatar")
async def get_avatar(
    current_user: CurrentUserDep,
    user_service: UserServiceDep,
):
    file = await user_service.get_user_avatar(current_user.id)
    if not file:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, detail="Avatar not found"
        )
    return Response(content=file, media_type="image/jpeg")


@user_router.post("/avatar")
async def set_avatar(
    file: UploadFile,
    current_user: CurrentUserDep,
    user_service: UserServiceDep,
):
    if not file or not file.filename:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST, detail="No file provided"
        )

    try:
        success = await user_service.set_user_avatar(current_user.id, file)

        if not success:
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail="Failed to upload avatar",
            )

        # Возвращаем загруженную аватарку
        avatar_bytes = await user_service.get_user_avatar(current_user.id)

        return Response(
            content=avatar_bytes,
            media_type="image/jpeg",
        )

    except ValueError as e:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=str(e))
    except Exception as e:
        logger.exception(e)
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Unexpected error: {str(e)}",
        )


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
