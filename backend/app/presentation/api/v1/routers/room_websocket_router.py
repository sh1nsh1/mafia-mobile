import logging

from fastapi import WebSocket, WebSocketDisconnect
from fastapi.routing import APIRouter

from presentation.api.v1.dependencies.alias import CurrentUserWsDep
from application.services.room_websocket_service import RoomWebSocketServiceDep
from infrastructure.websocket.dtos.websocket_message import WebSocketMessage


room_websocket_router = APIRouter()
logger = logging.getLogger(__name__)


@room_websocket_router.websocket("/rooms/{room_id}")
async def room_websocket(
    room_id: str,
    websocket: WebSocket,
    room_websocket_service: RoomWebSocketServiceDep,
    current_user: CurrentUserWsDep,
):
    logger.debug("room_websocket")
    await room_websocket_service.subscribe_room_webscoket(
        room_id, current_user, websocket
    )
    try:
        while True:
            raw_message: dict[str, any] = await websocket.receive_json()
            logger.debug(f"{raw_message} {type(raw_message)}")
            ws_message = WebSocketMessage(**raw_message)
            await room_websocket_service.handle_message(ws_message)
    except WebSocketDisconnect:
        await room_websocket_service.unsubscribe_room_webscoket(room_id, current_user)
