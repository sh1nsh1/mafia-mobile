from typing import Annotated

from fastapi import Depends

from application.services.jwt_service import JWTService
from application.services.user_service import UserService
from application.services.lobby_service import LobbyService
from application.services.security_service import SecurityService
from application.services.room_websocket_service import RoomWebSocketService


LobbyServiceDep = Annotated[LobbyService, Depends()]
RoomWebSocketServiceDep = Annotated[RoomWebSocketService, Depends()]
UserServiceDep = Annotated[UserService, Depends()]
SecurityServiceDep = Annotated[SecurityService, Depends()]
JWTServiceDep = Annotated[JWTService, Depends()]
