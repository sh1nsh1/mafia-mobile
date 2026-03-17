from domain.enums import WebSocketTopicEnum, WebSocketMessageTypeEnum
from infrastructure.websocket.dtos.websocket_info import WebSocketInfo
from infrastructure.websocket.dtos.websocket_invite import WebSocketInvite
from infrastructure.websocket.dtos.websocket_command import WebSocketCommand
from infrastructure.websocket.dtos.base_websocket_message import BaseWebSocketMessage


class WebSocketMessage(BaseWebSocketMessage):
    """
    message_type (MessageTypeEnum)
    topic (MessageTopicEnum)
    timestamp
    payload: {
        "action_type": "role_action" | "vote",
        "actor": "<player_user_id>",
        "actor_role": RoleEnum
        "target": "<player_user_id>"
        "room_id": "<room_id>
    }
    """

    message_type: WebSocketMessageTypeEnum
    topic: WebSocketTopicEnum
    timestamp: str
    payload: WebSocketCommand | WebSocketInfo | WebSocketInvite
