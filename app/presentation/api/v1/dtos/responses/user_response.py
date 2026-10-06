from uuid import UUID

from presentation.api.v1.dtos.base_dto import BaseDTO


class UserResponse(BaseDTO):
    id: UUID
    name: str
    email: str
