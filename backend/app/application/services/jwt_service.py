import uuid
import logging
from typing import Annotated
from datetime import datetime, timezone, timedelta

import jwt
from fastapi import Depends

from infrastructure.environment import env


class JWTService:
    def __init__(self):
        self._secret_key = env.jwt.secret_key
        self._algorithm = env.jwt.algorithm
        self._logger = logging.getLogger(self.__class__.__name__)

    async def create_access_token(
        self, jwt_claims: dict[str, any], expires_in_minutes: int
    ):
        self._logger.debug("create_access_token")
        payload = jwt_claims.copy()
        expire = datetime.now(timezone.utc) + timedelta(minutes=expires_in_minutes)

        payload.update(
            {
                "exp": expire.timestamp(),
                "type": "access",
                "jti": str(uuid.uuid4()),
                "iat": datetime.now(timezone.utc).timestamp(),
            }
        )
        jwt_token = jwt.encode(payload, self._secret_key)
        return jwt_token

    async def create_refresh_token(
        self, jwt_claims: dict[str, any], expires_in_days: int
    ):
        self._logger.debug("create_refresh_token")
        payload = jwt_claims.copy()
        expire = datetime.now(timezone.utc) + timedelta(minutes=expires_in_days)

        payload.update(
            {
                "exp": expire,
                "type": "refresh",
                "jti": str(uuid.uuid4()),
                "iat": datetime.now(timezone.utc),
            }
        )

        return jwt.encode(payload, self._secret_key)

    async def decode_token(self, token: str):
        self._logger.debug("decode_token")
        try:
            return jwt.decode(token, self._secret_key, algorithms=[self._algorithm])
        except jwt.ExpiredSignatureError:
            raise ValueError("Token has expired")
        except jwt.InvalidTokenError as e:
            self._logger.error(e)
            raise ValueError(f"Invalid token: {str(e.args)}")


JWTServiceDep = Annotated[JWTService, Depends()]
