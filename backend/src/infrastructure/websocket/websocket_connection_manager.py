from fastapi import WebSocket

from infrastructure.websocket.dtos.websocket_messages import WebSocketMessage


class WebSocketManager:
    _instance = None

    def __new__(cls):
        if cls._instance is None:
            cls._instance = super().__new__(cls)
            cls._instance._init()
        return cls._instance

    def _init(self):
        # context_id : dict[user_id: WebSocket]
        # context_id = lobby/game id
        self._active_connections: dict[str, dict[str, WebSocket]] = {}

    async def get_websocket(self, context_id: str, user_id: str) -> WebSocket:
        return self._active_connections[context_id][user_id]

    async def connect(self, ws: WebSocket, context_id: str, user_id: str):
        await ws.accept()
        if context_id not in self._active_connections:
            self._active_connections[context_id] = {}
        self._active_connections[context_id][user_id] = ws

    def disconnect(self, context_id: str, user_id: str):
        del self._active_connections[context_id][user_id]
        if not self._active_connections[context_id]:
            del self._active_connections[context_id]

    async def send_to_one(self, context_id: str, user_id: str, message: WebSocketMessage):
        ws = await self.get_websocket(context_id, user_id)
        await ws.send_json(message.to_dict())

    async def send_to_many(self, context_id: str, user_ids: list[str], message: WebSocketMessage):
        for user_id in user_ids:
            await self.send_to_one(context_id, user_id, message)

    async def send_broadcast(self, context_id: str, message: WebSocketMessage):
        all_users = list(self._active_connections[context_id].keys())
        await self.send_to_many(context_id, all_users, message)
