from typing import List
from lobby import Lobby
from user import User
from player import Player
from datetime import datetime
from enums import GameStateEnum, GameDayTimeEnum, TeamEnum


# todo maybe should split into GameStats and GameDynamicStats
class Game:
    game_id: str
    lobby: Lobby
    player_list: List[Player]
    player_count: int

    game_state: GameStateEnum
    winner_team: TeamEnum
    game_daytime: GameDayTimeEnum
    game_day_count: int

    admin: User
    start_date: datetime
    finish_date: datetime | None
