import logging
from contextlib import asynccontextmanager

from fastapi import FastAPI
from fastapi.requests import Request
from fastapi.responses import JSONResponse
from fastapi.middleware.cors import CORSMiddleware

from domain.exceptions import TokenException
from infrastructure.dependencies import init_db
from presentation.api.v1.routers.user_router import user_router
from presentation.api.v1.routers.lobby_router import lobby_router
from presentation.api.v1.routers.room_websocket_router import (
    room_websocket_router,
)


logging.basicConfig(level=logging.DEBUG, format="%(levelname)s: %(name)s: %(message)s")
logger = logging.getLogger(__name__)


@asynccontextmanager
async def lifespan(app: FastAPI):
    logger.debug("Mafia mobile server started")
    await init_db()
    # await init_game_manager()
    yield
    logger.debug("Mafia mobile server shut down")


app = FastAPI(lifespan=lifespan)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.exception_handler(TokenException)
def token_expired_exception_handler(request: Request, exc: TokenException):
    return JSONResponse(
        status_code=401,
        content={"expectedTokenType": exc.expected_token, "detail": exc.message},
    )


app.include_router(user_router)
app.include_router(lobby_router)
app.include_router(room_websocket_router)
