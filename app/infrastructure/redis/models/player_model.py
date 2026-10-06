from domain.enums import RoleEnum, PlayerStatusEnum


class PlayerModel:
    user_id: str
    is_alive: int
    votes_count: int
    role_name: RoleEnum
    status_list: str

    def __init__(
        self,
        user_id: str,
        is_alive: int,
        votes_count: int,
        role_name: RoleEnum,
        status_list: str,
    ):
        self.user_id = user_id
        self.is_alive = is_alive
        self.votes_count = int(votes_count)
        self.role_name = role_name
        self.status_list = status_list

    def to_dict(self):
        return {
            "user_id": self.user_id,
            "is_alive": self.is_alive,
            "votes_count": self.votes_count,
            "role_name": self.role_name,
            "status_list": self.status_list,
        }

    @classmethod
    def from_redis_data(cls, data: dict[str, any]):
        return cls(
            user_id=data["user_id"],
            is_alive=data["is_alive"],
            votes_count=data["votes_count"],
            role_name=RoleEnum(data["role_name"]),
            status_list=data["status_list"],
        )
