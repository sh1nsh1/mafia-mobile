from domain.enums import WebSocketTopicEnum, WebSocketMessageTypeEnum
from infrastructure.websocket.dtos.base_websocket_message import BaseWebSocketMessage
from infrastructure.websocket.dtos.websocket_game_info_payload import (
    WebSocketGameInfoPayload,
)
from infrastructure.websocket.dtos.websocket_game_command_payload import (
    WebSocketGameCommandPayload,
)
from infrastructure.websocket.dtos.websocket_lobby_command_payload import (
    WebSocketLobbyCommandPayload,
)
from infrastructure.websocket.dtos.websocket_game_game_data_payload import (
    WebSocketGameGameDataPayload,
)
from infrastructure.websocket.dtos.websocket_game_new_stage_payload import (
    WebSocketGameNewStagePayload,
)
from infrastructure.websocket.dtos.websocket_game_action_request_payload import (
    WebSocketGameActionRequestPayload,
)
from infrastructure.websocket.dtos.websocket_user_connection_message_payload import (
    WebSocketUserConnectionMessagePayload,
)


class WebSocketMessage(BaseWebSocketMessage):
    """
    message_type (MessageTypeEnum)
    # topic (MessageTopicEnum)
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
        WebSocketGameCommandPayload  # Game
        | WebSocketGameInfoPayload  # Game
        | WebSocketGameActionRequestPayload  # Game
        | WebSocketGameNewStagePayload  # Game
        | WebSocketGameGameDataPayload  # Game
        | WebSocketLobbyCommandPayload  # Lobby
        | WebSocketUserConnectionMessagePayload
    )
