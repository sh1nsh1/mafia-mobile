from uuid import UUID

from pydantic import BaseModel


class CurrentUserDTO(BaseModel):
    id: UUID
    username: str
    email: str
    # TODO extra data
