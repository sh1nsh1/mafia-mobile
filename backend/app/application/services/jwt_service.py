import os
import uuid
from pprint import pprint
from datetime import datetime
from datetime import timezone
from datetime import timedelta

import jwt


class JWTAService:
    def __init__(self):
        self._secret_key = os.getenv("SECRET_KEY")
        self._algorithm = os.getenv("JWT_ALGORITHM")

    async def create_access_token(
        self, jwt_claims: dict[str, any], expires_in_minutes: int
    ):
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
        pprint(payload)
        return jwt.encode(payload, self._secret_key, algorithm=self._algorithm)

    async def create_refresh_token(
        self, jwt_claims: dict[str, any], expires_in_days: int
    ):
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

        return jwt.encode(payload, self._secret_key, algorithm=self._algorithm)

    async def decode_token(self, token: str):
        try:
            return jwt.decode(token, self._secret_key, self._algorithm)
        except jwt.ExpiredSignatureError:
            raise ValueError("Token has expired")
        except jwt.InvalidTokenError as e:
            raise ValueError(f"Invalid token: {str(e.args)}")
