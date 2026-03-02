from uuid import UUID
from datetime import datetime

from sqlalchemy import func
from sqlalchemy.orm import Mapped, DeclarativeBase, mapped_column
from sqlalchemy.ext.asyncio import AsyncAttrs


class Base(AsyncAttrs, DeclarativeBase):
    __abstract__ = True
    id: Mapped[UUID] = mapped_column(primary_key=True)
    created_at: Mapped[datetime] = mapped_column(server_default=func.now())

    def __init_(self, **kwargs):
        for name, value in kwargs.items():
            setattr(self, name, value)
