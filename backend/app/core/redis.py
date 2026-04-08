import redis
from app.core.config import settings

# Added socket_timeout so the app doesn't hang if Redis is unreachable
redis_client = redis.from_url(
    settings.REDIS_URL, 
    decode_responses=True,
    socket_timeout=5,
    socket_connect_timeout=5
)

def get_redis():
    return redis_client
