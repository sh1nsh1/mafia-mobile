from botocore.client import BaseClient

from infrastructure.logger import get_logger


logger = get_logger(f"{__name__}.S3Repository", 20)


class S3Repository:
    def __init__(self, s3_client: BaseClient):
        self.client: BaseClient = s3_client
        self.BUCKET_NAME = "avatars"

    async def upload(self, key: str, data: bytes) -> None:
        self.client.put_object(Bucket=self.BUCKET_NAME, Key=key, Body=data)

    async def delete(self, key: str) -> None:
        self.client.delete_object(Bucket=self.BUCKET_NAME, Key=key)

    async def get_url(self, key: str) -> str:
        return self.client.generate_presigned_url(...)

    async def get_file(self, file_key: str) -> bytes:
        response = self.client.get_object(
            Bucket=self.BUCKET_NAME,
            Key=file_key,
        )
        file_bytes = response["Body"].read()
        response["Body"].close()

        return file_bytes
