from user import User
from datetime import datetime


class Lobby:
    lobby_id: str

    players_max_count: int
    admin: User
    start_date: datetime
