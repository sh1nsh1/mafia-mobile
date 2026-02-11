from dataclasses import asdict, dataclass

from domain.enums import WebSocketMessageTypeEnum, WebSocketTopicEnum


@dataclass
class WebSocketMessage:
    message_type: WebSocketMessageTypeEnum
    topic: WebSocketTopicEnum
    timestamp: str
    payload: dict[str, any]
    metadata: dict[str, any] | None

    @classmethod
    def create(
        cls,
        message_type: WebSocketMessageTypeEnum,
        topic: WebSocketTopicEnum,
        timestamp: str,
        payload: dict[str, any],
        metadata: dict[str, any] | None,
    ):
        return cls(message_type=message_type, topic=topic, timestamp=timestamp, payload=payload, metadata=metadata)

    def to_dict(self):
        return asdict(self)
