from uuid import UUID

from presentation.api.v1.dtos.base_dto import BaseDTO


class CurrentUser(BaseDTO):
    id: UUID
    username: str
    email: str
