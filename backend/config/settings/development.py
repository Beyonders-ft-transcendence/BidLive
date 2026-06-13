from .base import *  # noqa: F403

DEBUG = True
ALLOWED_HOSTS = ["*"]
CORS_ALLOW_ALL_ORIGINS = True

# Use an in-process cache in local development so endpoints that depend on
# throttling, such as schema/docs, do not fail when Redis is not reachable.
CACHES = {
    "default": {
        "BACKEND": "django.core.cache.backends.locmem.LocMemCache",
        "LOCATION": "bidlive-dev-cache",
    }
}

CHANNEL_LAYERS = {
    "default": {
        "BACKEND": "channels.layers.InMemoryChannelLayer",
    }
}

CELERY_TASK_ALWAYS_EAGER = True
CELERY_TASK_EAGER_PROPAGATES = True

EMAIL_BACKEND = env(
    "EMAIL_BACKEND",
    default="django.core.mail.backends.console.EmailBackend",
)
