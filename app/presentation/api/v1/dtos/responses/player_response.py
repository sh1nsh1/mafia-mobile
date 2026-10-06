from presentation.api.v1.dtos.responses.user_response import UserResponse


class PlayerResponse(UserResponse):
    is_alive: bool
