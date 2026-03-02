from uuid import UUID
from datetime import datetime

from sqlalchemy.orm import Mapped
from sqlalchemy.orm import mapped_column
from infrastructure.database.models.base_model import Base


class UserModel(Base):
    __tablename__ = "users"
    username: Mapped[str] = mapped_column(unique=True)
    email: Mapped[str] = mapped_column(unique=True)
    hashed_password: Mapped[str]
    updated_at: Mapped[datetime]

    def __init__(
        self,
        username: str,
        email: str,
        hashed_password: str,
        id: UUID,
        updated_at: datetime | None,
        created_at: datetime | None = None,
    ):
        super().__init__(id=id, created_at=created_at)
        self.username = username
        self.email = email
        self.hashed_password = hashed_password
        self.updated_at = updated_at or datetime.now()
