from typing import Annotated

from fastapi import Depends
from fastapi import WebSocket
from fastapi import WebSocketDisconnect
from fastapi.routing import APIRouter
from core.services.room_websocket_service import RoomWebSocketAService


room_websocket_router = APIRouter()


@room_websocket_router.websocket("/room/{room_id}")
async def room_websocket(
    room_id: str,
    user_id: str,
    websocket: WebSocket,
    room_websocket_service: Annotated[RoomWebSocketAService, Depends()],
):
    await room_websocket_service.subscribe_room_webscoket(
        room_id, user_id, websocket
    )
    try:
        while True:
            json_message = await websocket.receive_json()
            await room_websocket_service.handle_message(json_message, websocket)
    except WebSocketDisconnect:
        await room_websocket_service.unsubscribe_room_webscoket(
            room_id, user_id
        )
