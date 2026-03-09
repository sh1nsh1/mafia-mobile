import logging
from contextlib import asynccontextmanager

from fastapi import Depends, FastAPI
from fastapi.middleware.cors import CORSMiddleware

from presentation.api.v1.routers.user_router import user_router
from infrastructure.dependencies.dependencies import (
    init_db,
    get_db_session_factory,
)
from presentation.api.v1.routers.lobby_router import lobby_router
from presentation.api.v1.routers.room_websocket_router import (
    room_websocket_router,
)


logging.basicConfig(level=logging.DEBUG, format="%(levelname)s: %(name)s: %(message)s")


@asynccontextmanager
async def lifespan(app: FastAPI):
    await init_db()
    yield


app = FastAPI(lifespan=lifespan)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(user_router)
app.include_router(lobby_router)
app.include_router(room_websocket_router)
