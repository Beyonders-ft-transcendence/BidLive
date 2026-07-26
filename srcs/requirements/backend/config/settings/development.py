from .base import *  # noqa: F403
import os as _os

DEBUG = True
ALLOWED_HOSTS = ["*"]
CORS_ALLOW_ALL_ORIGINS = True

# In containerised development (Docker), Redis is always available.
# Only fall back to LocMemCache when Redis URL is not configured.
_redis_url = _os.environ.get("REDIS_URL", "")
if _redis_url:
    CACHES = {
        "default": {
            "BACKEND": "django.core.cache.backends.redis.RedisCache",
            "LOCATION": _redis_url,
        }
    }
else:
    # Pure local dev without Redis
    CACHES = {
        "default": {
            "BACKEND": "django.core.cache.backends.locmem.LocMemCache",
            "LOCATION": "bidlive-dev-cache",
        }
    }

# IMPORTANT: InMemoryChannelLayer breaks WebSockets in multi-worker setups.
# Each gunicorn worker has an isolated in-memory state — broadcast messages
# sent in one worker never reach consumers in other workers.
# Always use RedisChannelLayer when Redis is available.
if _redis_url:
    CHANNEL_LAYERS = {
        "default": {
            "BACKEND": "channels_redis.core.RedisChannelLayer",
            "CONFIG": {
                "hosts": [_redis_url],
            },
        }
    }
else:
    # Pure local dev without Redis: single-worker only
    CHANNEL_LAYERS = {
        "default": {
            "BACKEND": "channels.layers.InMemoryChannelLayer",
        }
    }

CELERY_TASK_ALWAYS_EAGER = not bool(_redis_url)
CELERY_TASK_EAGER_PROPAGATES = not bool(_redis_url)

EMAIL_BACKEND = env(
    "EMAIL_BACKEND",
    default="django.core.mail.backends.console.EmailBackend",
)
