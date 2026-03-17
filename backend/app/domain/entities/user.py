from uuid import UUID
from datetime import datetime
from dataclasses import dataclass


@dataclass
class User:
    """
    User is a representation of a real-life user in the
    """

    id: UUID
    username: str
    email: str
    hashed_password: str
    created_at: datetime | None = None
    updated_at: datetime | None = None
