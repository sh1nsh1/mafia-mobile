import asyncio
from uuid import UUID
from typing import Callable, Awaitable

from fastapi import WebSocket


class RoomConnection:
    send_state_message: Callable[[str, UUID], Awaitable[None]]

    def __init__(
        self,
        websocket: WebSocket,
        message_queue: asyncio.Queue,
    ):
        self.websocket = websocket
        self.message_queue = message_queue
        self.is_disconnected = False
        self.is_callback_set = False
