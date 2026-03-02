from typing import Annotated

from fastapi import Depends
from fastapi import WebSocket
from fastapi import WebSocketDisconnect
from fastapi.routing import APIRouter
from api.v1.dependencies import get_current_user_ws
from api.v1.dtos.current_user_dto import CurrentUserDTO
from application.services.room_websocket_service import RoomWebSocketAService


room_websocket_router = APIRouter()


@room_websocket_router.websocket("/room/{room_id}")
async def room_websocket(
    room_id: str,
    websocket: WebSocket,
    room_websocket_service: Annotated[RoomWebSocketAService, Depends()],
    current_user: Annotated[CurrentUserDTO, Depends(get_current_user_ws)],
):
    await room_websocket_service.subscribe_room_webscoket(
        room_id, current_user.id, websocket
    )
    try:
        while True:
            json_message = await websocket.receive_json()
            await room_websocket_service.handle_message(json_message, websocket)
    except WebSocketDisconnect:
        await room_websocket_service.unsubscribe_room_webscoket(
            room_id, current_user.id
        )
