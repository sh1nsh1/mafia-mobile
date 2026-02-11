from fastapi import Depends, WebSocket, WebSocketDisconnect
from fastapi.routing import APIRouter

from api.v1 import dependencies as api_dep
from core.services.lobby_websocket_service import LobbyWebSocketAService

websocket_router = APIRouter(prefix="/ws")


@websocket_router.websocket("/lobby/{lobby_id}")
async def join_lobby_ws(
    lobby_id: str,
    user_id: str,
    websocket: WebSocket,
    lobby_websocket_service: LobbyWebSocketAService = Depends(api_dep.get_lobby_websocket_aservice),
):
    await lobby_websocket_service.subscribe_lobby_webscoket(lobby_id, user_id, websocket)
    try:
        while True:
            json_message = await websocket.receive_json()
            await lobby_websocket_service.handle_message(json_message, websocket)
    except WebSocketDisconnect:
        await lobby_websocket_service.unsubscribe_lobby_webscoket(lobby_id, user_id)
