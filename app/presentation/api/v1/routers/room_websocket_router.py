from datetime import datetime

from dishka import FromDishka, AsyncContainer
from fastapi import WebSocket, WebSocketDisconnect
from fastapi.routing import APIRouter
from dishka.integrations.fastapi import inject

from domain.enums import WebSocketTopicEnum, WebSocketMessageTypeEnum
from domain.exceptions import DomainException
from application.services import SecurityService, RoomWebSocketService
from infrastructure.logger import get_logger
from infrastructure.websocket.dtos import (
    WebSocketMessage,
    WebSocketGameInfoPayload,
)


room_websocket_router = APIRouter()
logger = get_logger(__name__, 10)


@room_websocket_router.websocket("/rooms/{room_id}")
@inject
async def room_websocket(
    room_id: str, websocket: WebSocket, container: FromDishka[AsyncContainer]
):
    logger.debug("room_websocket")
    token = websocket.headers.get("authorization", "").removeprefix("Bearer ")

    async with container() as request_container:
        security_service = await request_container.get(SecurityService)
        current_user = await security_service.get_current_user(token)
        room_websocket_service = await request_container.get(
            RoomWebSocketService
        )
        await room_websocket_service.subscribe_room_webscoket(
            room_id, current_user, websocket
        )
    try:
        while True:
            raw_message: dict[str, any] = await websocket.receive_json()
            logger.debug(f"{raw_message} {type(raw_message)}")
            ws_message = WebSocketMessage(**raw_message)
            try:
                async with container() as request_container:
                    room_service = await request_container.get(
                        RoomWebSocketService
                    )
                    await room_service.handle_message(ws_message)

            except DomainException as e:
                logger.error(
                    f"Error on handling message: {ws_message.model_dump()}\nError: {e.args}"
                )
                await websocket.send_json(
                    WebSocketMessage(
                        message_type=WebSocketMessageTypeEnum.ERROR,
                        topic=WebSocketTopicEnum(e.topic),
                        timestamp=datetime.now().isoformat(),
                        payload=WebSocketGameInfoPayload(text=e.message),
                    ).model_dump_json(by_alias=True)
                )

    except WebSocketDisconnect:
        logger.info(
            f"{current_user.username} разорвал соединение с комнатой {room_id}"
        )
        async with container() as request_container:
            room_service = await request_container.get(RoomWebSocketService)
            await room_service.unsubscribe_room_webscoket(room_id, current_user)
