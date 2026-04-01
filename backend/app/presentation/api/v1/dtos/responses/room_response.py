from presentation.api.v1.dtos.base_dto import BaseDTO


class RoomResponse(BaseDTO):
    room_id: str
    is_lobby: bool
