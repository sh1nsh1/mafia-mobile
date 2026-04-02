# domain/entities/avatar.py
from uuid import UUID
from typing import Optional
from datetime import datetime
from dataclasses import dataclass


@dataclass
class Avatar:
    user_id: UUID
    file_key: str
    file_name: str
    file_size: int
    content_type: str
    id: Optional[UUID] = None
    created_at: Optional[datetime] = None
    updated_at: Optional[datetime] = None

    def __post_init__(self):
        if not self.content_type.startswith("image/"):
            raise ValueError("Only image files are allowed")

        if self.file_size > 5 * 1024 * 1024:  # 5 MB
            raise ValueError("Avatar file size must be less than 5 MB")
