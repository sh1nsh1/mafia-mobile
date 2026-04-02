import asyncio
from uuid import UUID
from typing import Callable, Awaitable

from fastapi import WebSocket

from infrastructure.websocket.dtos.websocket_message import WebSocketMessage


class RoomConnection:
    send_state_message: Callable[[str, UUID], Awaitable[None]]
    last_action_request_message: WebSocketMessage | None

    def __init__(
        self,
        websocket: WebSocket,
        message_queue: asyncio.Queue,
    ):
        self.websocket = websocket
        self.message_queue = message_queue
        self.is_disconnected = False
        self.is_callback_set = False
        self.last_action_request_message = None
