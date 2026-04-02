# infrastructure/repositories/avatar_repository.py

import logging
from uuid import UUID
from typing import Annotated
from datetime import datetime

from fastapi import Depends, UploadFile
from sqlalchemy import delete, select
from botocore.exceptions import ClientError

from infrastructure.factories import DBSessionFactoryDep
from infrastructure.database.models.avatar_model import AvatarModel
from infrastructure.s3.repositories.s3repository import S3RepositoryDep


class AvatarRepository:
    def __init__(
        self,
        session_factory: DBSessionFactoryDep,
        s3_repository: S3RepositoryDep,
        bucket_name: str = "avatars",
    ):
        self.session_factory = session_factory
        self.s3_repository = s3_repository
        self.bucket_name = bucket_name
        self._logger = logging.getLogger(self.__class__.__name__)

    async def get_avatar_file(self, user_id: UUID) -> bytes | None:
        """
        Получает файл аватарки из RustFS
        """
        self._logger.debug(f"get_avatar_file for user: {user_id}")

        # Получаем путь к файлу из БД
        file_key = await self._get_file_key_by_user_id(user_id)
        if not file_key:
            return None

        try:
            # Получаем файл из RustFS
            file = await self.s3_repository.get_file(file_key)
            return file

        except ClientError as e:
            self._logger.error(f"Failed to get avatar from S3: {e}")
            return None

    async def upload_avatar(self, user_id: UUID, file: UploadFile) -> bool:
        """
        Загружает аватарку в RustFS
        """
        self._logger.info(f"upload_avatar {user_id}")
        self._logger.info(f"file:\n{file.content_type}\n{file.filename}")
        # Генерируем путь
        file_extension = file.filename.split(".")[-1] if file.filename else "jpg"
        file_key = f"avatars/{user_id}/avatar.{file_extension}"

        # Читаем файл
        content = await file.read()
        self._logger.info(f"\n\tfile_key:{file_key}\n\tcontent:{content[:80]}")

        try:
            # Загружаем в RustFS
            await self.s3_repository.upload(file_key, content)
            # Сохраняем метаданные в БД

            await self._save_avatar_metadata(user_id, file_key, file, len(content))
            # Если была старая аватарка - удаляем

            await self._delete_old_avatar(user_id, file_key)

            return True

        except ClientError as e:
            self._logger.exception(e)
            return False

    # async def delete_avatar(self, user_id: UUID) -> bool:
    #     """
    #     Удаляет аватарку пользователя
    #     Returns: True если удалено, False если не было
    #     """
    #     self._logger.debug(f"delete_avatar for user: {user_id}")

    #     # Получаем путь к файлу
    #     file_key = await self._get_file_key_by_user_id(user_id)
    #     if not file_key:
    #         return False

    #     try:
    #         # Удаляем файл из RustFS
    #         await self.s3_repository.delete(file_key)

    #         # Удаляем запись из БД
    #         await self._delete_avatar_metadata(user_id)

    #         return True

    #     except ClientError as e:
    #         self._logger.error(f"S3 delete error: {e}")
    #         return False

    async def _get_file_key_by_user_id(self, user_id: UUID) -> str | None:
        """Получает file_key из БД по user_id"""
        async with self.session_factory() as session:
            statement = select(AvatarModel.file_key).where(
                AvatarModel.user_id == user_id
            )
            result = await session.execute(statement)
            return result.scalar_one_or_none()

    async def _save_avatar_metadata(
        self, user_id: UUID, file_key: str, file: UploadFile, file_size: int
    ):
        """Сохраняет метаданные в БД"""
        from infrastructure.database.models.avatar_model import AvatarModel

        async with self.session_factory() as session:
            async with session.begin():
                # Проверяем, есть ли уже запись
                stmt = select(AvatarModel).where(AvatarModel.user_id == user_id)
                result = await session.execute(stmt)
                avatar_model = result.scalar_one_or_none()

                if avatar_model:
                    # Обновляем существующую
                    avatar_model.file_key = file_key
                    avatar_model.file_name = file.filename or "avatar"
                    avatar_model.file_size = file_size
                    avatar_model.content_type = file.content_type or "image/jpeg"
                else:
                    # Создаём новую
                    avatar_model = AvatarModel(
                        user_id=user_id,
                        file_key=file_key,
                        file_name=file.filename or "avatar",
                        file_size=file_size,
                        content_type=file.content_type or "image/jpeg",
                        updated_at=datetime.now(),
                    )
                    session.add(avatar_model)

    async def _delete_avatar_metadata(self, user_id: UUID):
        """Удаляет метаданные из БД"""
        async with self.session_factory() as session:
            async with session.begin():
                stmt = delete(AvatarModel).where(AvatarModel.user_id == user_id)
                await session.execute(stmt)

    async def _delete_old_avatar(self, user_id: UUID, new_file_key: str):
        """Удаляет старый файл, если он отличается от нового"""
        old_file_key = await self._get_file_key_by_user_id(user_id)

        # Если старый файл существует и это не тот же самый файл
        if old_file_key and old_file_key != new_file_key:
            try:
                await self.s3_repository.delete(old_file_key)
            except ClientError as e:
                self._logger.warning(f"Failed to delete old avatar: {e}")


AvatarRepositoryDep = Annotated[AvatarRepository, Depends()]
