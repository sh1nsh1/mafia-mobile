from uuid import UUID
from datetime import datetime

from domain.enums import TeamEnum, GameStageEnum, GameStatusEnum


class GameModel:
    def __init__(
        self,
        id: str,
        player_ids: list[str | UUID],
        admin_id: str | UUID,
        round_count: int,
        start_date: str,
        game_status: GameStatusEnum,
        game_stage: GameStageEnum,
        winner_team: TeamEnum | None,
        finish_date: str | None,
    ):
        self.id = id
        self.player_ids: list[str] = []
        for player_user_id in player_ids:
            if isinstance(player_user_id, UUID):
                self.player_ids.append(str(player_user_id))
            else:
                self.player_ids.append(player_user_id)
        self.admin_id = str(admin_id) if isinstance(admin_id, UUID) else admin_id
        self.round_count = round_count
        self.start_date = start_date or datetime.now().isoformat()
        self.game_status = game_status
        self.game_stage = game_stage
        self.winner_team = winner_team
        self.finish_date = finish_date

    def to_dict(self):
        return {
            "id": self.id,
            "admin_id": self.admin_id,
            "round_count": self.round_count,
            "start_date": self.start_date,
            "game_status": self.game_status,
            "game_stage": self.game_stage,
            "winner_team": self.winner_team,
            "finish_date": self.finish_date,
        }

    @classmethod
    def from_redis_data(cls, data: dict[str, any]):
        return cls(
            id=data["id"],
            player_ids=data["player_ids"],
            admin_id=data["admin_id"],
            round_count=data["round_count"],
            start_date=data["start_date"],
            game_status=data["game_status"],
            game_stage=data["game_stage"],
            winner_team=data["winner_team"],
            finish_date=data["finish_date"],
        )
