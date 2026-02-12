from fastapi import Depends, WebSocket, WebSocketDisconnect
from fastapi.routing import APIRouter

from api.v1 import dependencies as api_dep
from core.services.room_websocket_service import RoomWebSocketAService

room_websocket_router = APIRouter(prefix="/ws")


@room_websocket_router.websocket("/room/{room_id}")
async def room_websocket(
    room_id: str,
    user_id: str,
    websocket: WebSocket,
    room_websocket_service: RoomWebSocketAService = Depends(api_dep.get_room_websocket_aservice),
):
    await room_websocket_service.subscribe_room_webscoket(room_id, user_id, websocket)
    try:
        while True:
            json_message = await websocket.receive_json()
            await room_websocket_service.handle_message(json_message, websocket)
    except WebSocketDisconnect:
        await room_websocket_service.unsubscribe_room_webscoket(room_id, user_id)
