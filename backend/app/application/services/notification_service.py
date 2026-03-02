from infrastructure.websocket.websocket_manager import WebSocketManager


class Event:
    pass


class NotificationService:
    def __init__(self, connection_manager: WebSocketManager) -> None:
        self._connection_manager = connection_manager

    async def notify_one(self, event: Event):
        pass

    async def notify_many(self, event: Event):
        pass

    async def notify_all(self, even: Event):
        pass
