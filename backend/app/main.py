import logging
from contextlib import asynccontextmanager

from dotenv import load_dotenv
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from api.v1.routers.user_router import user_router
from api.v1.routers.lobby_router import lobby_router
from infrastructure.dependencies import init_db, get_db_session_factory
from api.v1.routers.room_websocket_router import room_websocket_router


logging.basicConfig(level=logging.DEBUG, format="%(levelname)s: %(name)s: %(message)s")


@asynccontextmanager
async def lifespan(app: FastAPI):
    load_dotenv()
    await init_db(await get_db_session_factory())
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
