from dotenv import load_dotenv
from fastapi import FastAPI
import uvicorn

from api.v1.routers.lobby_router import lobby_router
from api.v1.routers.websocket_router import websocket_router
from infrastructure.websocket.websocket_connection_manager import WebSocketManager

load_dotenv()

websocket = WebSocketManager()
app = FastAPI()
app.include_router(lobby_router)
app.include_router(websocket_router)

if __name__ == "__main__":
    uvicorn.run(
        app="main:app",
        host="127.0.0.1",
        port=8000,
    )
