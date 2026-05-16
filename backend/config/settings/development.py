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

EMAIL_BACKEND = "django.core.mail.backends.console.EmailBackend"
