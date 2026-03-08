from redis.asyncio import Redis

from infrastructure.environment import env


class RedisClientFactory:
    def __call__(self) -> Redis:
        self.client = Redis.from_url(env.redis.url)
        return self.client
