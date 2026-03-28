import asyncio

from fastapi import WebSocket


class RoomConnection:
    def __init__(
        self,
        websocket: WebSocket,
        message_queue: asyncio.Queue,
    ):
        self.websocket = websocket
        self.message_queue = message_queue
        self.is_ready = True
