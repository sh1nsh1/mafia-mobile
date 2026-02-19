import os

import redis.asyncio as redis


class RedisClientFactory:
    def __call__(self) -> redis.Redis:
        redis_url = dict(os.environ)["REDIS_URL"]
        self.client = redis.from_url(redis_url)
        return self.client
