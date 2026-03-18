from domain.enums import WebSocketTopicEnum, WebSocketMessageTypeEnum
from infrastructure.websocket.dtos.websocket_game_info import WebSocketGameInfo
from infrastructure.websocket.dtos.websocket_game_invite import WebSocketGameInvite
from infrastructure.websocket.dtos.base_websocket_message import BaseWebSocketMessage
from infrastructure.websocket.dtos.websocket_game_command import WebSocketGameCommand
from infrastructure.websocket.dtos.websocket_lobby_command import WebSocketLobbyCommand


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
    payload: (
        WebSocketGameCommand  # Game
        | WebSocketGameInfo  # Game
        | WebSocketGameInvite  # Game
        | WebSocketLobbyCommand  # Lobby
    )
