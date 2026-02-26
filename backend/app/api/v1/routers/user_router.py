from typing import Annotated

from fastapi import Depends
from fastapi import HTTPException
from fastapi.routing import APIRouter
from domain.exceptions import DomainException
from application.services.lobby_service import LobbyAService

from api.v1.response_models import lobby_response_model as responses


user_router = APIRouter(prefix="/user")


@user_router.post("/login")
async def login():
    pass
