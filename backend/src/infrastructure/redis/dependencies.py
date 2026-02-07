import os

import redis.asyncio as redis


async def get_redis_client():
    redis_url = dict(os.environ)["REDIS_URL"]
    redis_client = redis.from_url(redis_url)

    yield redis_client
