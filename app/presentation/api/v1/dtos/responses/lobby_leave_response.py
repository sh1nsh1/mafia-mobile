from presentation.api.v1.dtos.base_dto import BaseDTO


class LobbyLeaveResponse(BaseDTO):
    status: str
    message: str
    lobby_id: str
