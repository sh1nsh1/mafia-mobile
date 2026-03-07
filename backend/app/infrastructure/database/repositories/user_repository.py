import logging
from uuid import UUID

import sqlalchemy.exc as exc
from sqlalchemy import select

from domain.exceptions import RepoException
from domain.entities.user import User
from infrastructure.dependencies.alias import DBSessionFactoryDep
from infrastructure.database.models.user_model import UserModel


class UserRepository:
    def __init__(self, session_factory: DBSessionFactoryDep):
        self.session_factory = session_factory
        self.logger = logging.getLogger(self.__class__.__name__)

    async def get_user_by_id(self, user_id: UUID) -> User | None:
        """
        Получает User по ID
        Args:
            user_id (int): User ID
        Returns:
            user (User / None): Доменная сущность User или None
        """
        self.logger.debug("get_user_by_id")
        user_model = await self._get_user_model_by_id(user_id)
        return await self._model_to_domain(user_model) if user_model else None

    async def get_user_by_username(self, username: str) -> User | None:
        """
        Получает User по ID
        Args:
            username (str): имя User
        Returns:
            user (User / None): Доменная сущность User или None
        """
        self.logger.debug("get_user_by_username")
        user_model = await self._get_user_model_by_username(username)
        return await self._model_to_domain(user_model) if user_model else None

    async def create_user(self, user: User) -> User:
        """
        Получает User по ID
        Args:
            user (User): Доменная сущность User
        Raises
            DatabaseError: Ошибка базы данных
        """
        self.logger.debug("create_user")
        user_model = await self._domain_to_model(user)
        async with self.session_factory() as session:
            async with session.begin():
                try:
                    session.add(user_model)
                    await session.commit()
                except exc.IntegrityError as e:
                    await session.rollback()
                    self.logger.error(e)
                    raise RepoException(*e.args)

                updated_user = await self.get_user_by_username(
                    user_model.username
                )
                if not updated_user:
                    raise RepoException()

                return updated_user

    async def _get_user_model_by_id(self, user_id: UUID) -> UserModel | None:
        self.logger.debug("_get_user_model_by_id")
        async with self.session_factory() as session:
            try:
                statement = select(UserModel).where(UserModel.id == user_id)
                result = await session.execute(statement)
                user_model = result.scalar_one_or_none()
                return user_model
            except exc.IntegrityError as e:
                self.logger.error(e)
                raise ValueError(e)

    async def _get_user_model_by_username(
        self, username: str
    ) -> UserModel | None:
        self.logger.debug("_get_user_model_by_username")
        async with self.session_factory() as session:
            try:
                statement = select(UserModel).where(
                    UserModel.username == username
                )
                result = await session.execute(statement)
                user_model = result.scalar_one_or_none()
                return user_model
            except exc.IntegrityError as e:
                self.logger.error(e)
                raise

    async def _model_to_domain(self, user_model: UserModel) -> User:
        return User(
            username=user_model.username,
            email=user_model.email,
            hashed_password=user_model.hashed_password,
            id=user_model.id,
            created_at=user_model.created_at,
            updated_at=user_model.updated_at,
        )

    async def _domain_to_model(self, user: User) -> UserModel:
        return UserModel(
            username=user.username,
            email=user.email,
            hashed_password=user.hashed_password,
            id=user.id,
            created_at=user.created_at,
            updated_at=user.updated_at,
        )
