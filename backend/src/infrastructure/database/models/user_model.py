from infrastructure.database.models.base_model import Base
from sqlalchemy.orm import Mapped
from sqlalchemy import DateTime

class UserModel(Base):
    username:Mapped[str]
    password:Mapped[str]
    updated_ad = Mapped["Datetime"]
    