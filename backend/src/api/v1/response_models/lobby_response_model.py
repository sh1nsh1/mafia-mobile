from dataclasses import dataclass


@dataclass
class LobbyCreateResponse():
    status: str
    message: str
    lobby_id: str
    admin_id: str
    max_players: int


@dataclass
class LobbyJoinResponse():
    status: str
    message: str
    lobby_id: str


@dataclass
class LobbyLeaveResponse():
    status: str
    message: str
    lobby_id: str
