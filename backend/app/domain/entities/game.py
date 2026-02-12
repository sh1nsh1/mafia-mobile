from typing import List
from lobby import Lobby
from user import User
from player import Player
from enums import GameStateEnum, TeamEnum
from game_engine import GameEngine
from datetime import datetime


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
