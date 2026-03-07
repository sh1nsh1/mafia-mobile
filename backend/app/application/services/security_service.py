import uuid
import logging

from pwdlib import PasswordHash
from fastapi import HTTPException

from domain.entities.user import User
from application.dependenices.alias import JWTServiceDep
from infrastructure.dependencies.alias import UserRepositoryDep
from application.queries.user_auth_query import UserAuthQuery
from application.commands.user_create_command import UserCreateCommand
from presentation.api.v1.dtos.responses.token_pair_dto import TokenPairDTO
from presentation.api.v1.dtos.requests.current_user_dto import CurrentUserDTO
from presentation.api.v1.dtos.responses.user_create_response import (
    UserCreateResponse,
)


class SecurityService:
    def __init__(
        self, jwt_service: JWTServiceDep, user_repository: UserRepositoryDep
    ):
        self._jwt_service = jwt_service
        self._user_repository = user_repository
        self._pwd_context = PasswordHash.recommended()
        self._FAKE_HASH = self._pwd_context.hash("nan1kanopasuwaad0")
        self._logger = logging.getLogger(self.__class__.__name__)
        self._logger.setLevel(10)

    def _verify_password(self, plain_password: str, hashed_password: str):
        self._logger.debug("_verify_password")
        """
        Verifies if a plain_password matches a hashed_password.
        """
        return self._pwd_context.verify(plain_password, hashed_password)

    def _get_password_hash(self, password: str):
        self._logger.debug("_get_password_hash")

        """
        Hashes a password
        """
        return self._pwd_context.hash(password)

    async def login(self, user_credentials: UserAuthQuery) -> TokenPairDTO:
        self._logger.debug("login")

        """
        Authenticate user by his credentials and return a pair of access and refresh tokens
        """

        current_user = await self._user_repository.get_user_by_username(
            user_credentials.username
        )
        auth_exc = Exception("Wrong username or password")
        if not current_user:
            # immitate password check for non-existent user
            self._verify_password(user_credentials.password, self._FAKE_HASH)
            self._logger.error(auth_exc)
            raise auth_exc
        if not self._verify_password(
            user_credentials.password, current_user.hashed_password
        ):
            self._logger.error(auth_exc)
            raise auth_exc

        token_pair = await self._create_token_pair(current_user.username)
        self._logger.debug(token_pair.model_dump())
        return token_pair

    async def register_user(self, user_data: UserCreateCommand):
        self._logger.debug("register_user")

        hashed_password = self._get_password_hash(user_data.password)
        user_id = uuid.uuid4()

        user = User(
            user_id, user_data.username, user_data.email, hashed_password
        )
        updated_user = await self._user_repository.create_user(user)
        token_pair = await self._create_token_pair(updated_user.username)
        return UserCreateResponse(
            status="OK",
            message=f"User {user_data.username} successfully registered",
            access_token=token_pair.access_token,
            refresh_token=token_pair.refresh_token,
        )

    async def refresh_token(self, refresh_token: str):
        data = await self._jwt_service.decode_token(refresh_token)
        if data["type"] != "refresh":
            raise ValueError("Invalid token type")
        username = data["sub"]
        return await self._create_token_pair(username)

    async def logout(self):
        pass

    async def get_current_user(self, access_token: str) -> CurrentUserDTO:
        self._logger.debug("get_current_user")

        try:
            data = await self._jwt_service.decode_token(access_token)

            if data["type"] != "access":
                raise ValueError("Invalid token type")

            user = await self._user_repository.get_user_by_username(data["sub"])
            if not user:
                raise ValueError("User not found")

            return CurrentUserDTO(
                id=user.id, username=user.username, email=user.email
            )

        except ValueError as e:
            raise HTTPException(401, e.args)

    async def _create_token_pair(self, username: str) -> TokenPairDTO:
        self._logger.debug("_create_token_pair")

        jwt_claims = {
            "sub": str(username),
            # TODO sid:
        }

        access_token = await self._jwt_service.create_access_token(
            jwt_claims, 15
        )
        refresh_token = await self._jwt_service.create_refresh_token(
            jwt_claims, 30
        )

        return TokenPairDTO(
            access_token=access_token, refresh_token=refresh_token
        )
