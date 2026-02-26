from dotenv import load_dotenv
from fastapi import FastAPI
from api.v1.routers.lobby_router import lobby_router
from api.v1.routers.room_websocket_router import room_websocket_router
from infrastructure.database.db_session_factory import DBSessionFactory
from infrastructure.websocket.websocket_manager import (
    WebSocketManager,
)


load_dotenv()

websocket = WebSocketManager()

app = FastAPI()
app.include_router(lobby_router)
app.include_router(room_websocket_router)
