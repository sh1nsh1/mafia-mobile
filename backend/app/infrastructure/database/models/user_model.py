from sqlalchemy import DateTime
from sqlalchemy.orm import Mapped
from infrastructure.database.models.base_model import Base


class UserModel(Base):
    username: Mapped[str]
    email: Mapped[str]
    updated_ad = Mapped[DateTime]
