from fastapi import WebSocket, WebSocketDisconnect
from fastapi.routing import APIRouter

from application.dependenices.alias import RoomWebSocketServiceDep
from presentation.api.v1.dependencies.alias import CurrentUserDep


room_websocket_router = APIRouter()


@room_websocket_router.websocket("/room/{room_id}")
async def room_websocket(
    room_id: str,
    websocket: WebSocket,
    room_websocket_service: RoomWebSocketServiceDep,
    current_user: CurrentUserDep,
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
