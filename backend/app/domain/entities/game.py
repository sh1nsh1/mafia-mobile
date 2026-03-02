from typing import List
from datetime import datetime

from user import User
from enums import TeamEnum
from enums import GameStateEnum
from lobby import Lobby
from player import Player
from game_engine import GameEngine


# todo maybe should split into GameStats and GameDynamicStats
class Game:
    game_id: str
    lobby: Lobby
    players: List[Player]
    player_count: int

    engine: GameEngine
    game_state: GameStateEnum
    winner_team: TeamEnum

    admin: User
    start_date: datetime
    finish_date: datetime | None
