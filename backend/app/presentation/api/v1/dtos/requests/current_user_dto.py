from uuid import UUID

from presentation.api.v1.dtos.base_dto import BaseDTO


class CurrentUserDTO(BaseDTO):
    id: UUID
    username: str
    email: str
    # TODO extra data
