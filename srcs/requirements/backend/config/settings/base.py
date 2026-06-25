from datetime import timedelta
from pathlib import Path

import environ

BASE_DIR = Path(__file__).resolve().parents[2]

env = environ.Env(
    DEBUG=(bool, False),
    DATABASE_CONN_MAX_AGE=(int, 60),
    DATABASE_ATOMIC_REQUESTS=(bool, True),
)

environ.Env.read_env(BASE_DIR / ".env")

APP_NAME = env("APP_NAME", default="bidlive")
SECRET_KEY = env("SECRET_KEY", default="unsafe-default")
DEBUG = env("DEBUG")

ALLOWED_HOSTS = [host.strip() for host in env("ALLOWED_HOSTS", default="").split(",") if host]
CSRF_TRUSTED_ORIGINS = [
    origin.strip() for origin in env("CSRF_TRUSTED_ORIGINS", default="").split(",") if origin
]

INSTALLED_APPS = [
    "django_prometheus",
    "django.contrib.admin",
    "django.contrib.auth",
    "django.contrib.contenttypes",
    "django.contrib.sessions",
    "django.contrib.messages",
	"daphne",
    "django.contrib.staticfiles",
    "django.contrib.sites",
    "corsheaders",
    "rest_framework",
    "rest_framework_simplejwt",
    "rest_framework_simplejwt.token_blacklist",
    "drf_spectacular",
    "django_filters",
    "channels",
    "allauth",
    "allauth.account",
    "allauth.socialaccount",
    "allauth.socialaccount.providers.google",
    "dj_rest_auth",
    "dj_rest_auth.registration",
    "apps.users",
    "apps.domain",
    "apps.auctions",
    "apps.chat",
    "apps.notifications",
    "apps.storage",
    "apps.analytics",
    "apps.access",
    "apps.reports",
    "apps.social",
]

MIDDLEWARE = [
    "django.middleware.security.SecurityMiddleware",
    "django_prometheus.middleware.PrometheusBeforeMiddleware",
    "whitenoise.middleware.WhiteNoiseMiddleware",
    "django.contrib.sessions.middleware.SessionMiddleware",
    "corsheaders.middleware.CorsMiddleware",
    "common.middleware.RequestIDMiddleware",
    "apps.users.middleware.authorization.AuthorizationAuditMiddleware",
    "django.middleware.common.CommonMiddleware",
    "django.middleware.csrf.CsrfViewMiddleware",
    "django.contrib.auth.middleware.AuthenticationMiddleware",
    "allauth.account.middleware.AccountMiddleware",
    "django.contrib.messages.middleware.MessageMiddleware",
    "django_prometheus.middleware.PrometheusAfterMiddleware",
    "django.middleware.clickjacking.XFrameOptionsMiddleware",
]

ROOT_URLCONF = "config.urls"

TEMPLATES = [
    {
        "BACKEND": "django.template.backends.django.DjangoTemplates",
        "DIRS": [BASE_DIR / "templates"],
        "APP_DIRS": True,
        "OPTIONS": {
            "context_processors": [
                "django.template.context_processors.debug",
                "django.template.context_processors.request",
                "django.contrib.auth.context_processors.auth",
                "django.contrib.messages.context_processors.messages",
            ],
        },
    }
]

WSGI_APPLICATION = "config.wsgi.application"
ASGI_APPLICATION = "config.asgi.application"

DATABASES = {
    "default": env.db("DATABASE_URL", default="postgresql://bidlive:bidlive@localhost:5432/bidlive")
}
DATABASES["default"]["CONN_MAX_AGE"] = env("DATABASE_CONN_MAX_AGE")
DATABASES["default"]["ATOMIC_REQUESTS"] = env("DATABASE_ATOMIC_REQUESTS")

AUTH_PASSWORD_VALIDATORS = [
    {"NAME": "django.contrib.auth.password_validation.UserAttributeSimilarityValidator"},
    {"NAME": "django.contrib.auth.password_validation.MinimumLengthValidator"},
    {"NAME": "django.contrib.auth.password_validation.CommonPasswordValidator"},
    {"NAME": "django.contrib.auth.password_validation.NumericPasswordValidator"},
]

PASSWORD_HASHERS = [
    "django.contrib.auth.hashers.Argon2PasswordHasher",
    "django.contrib.auth.hashers.PBKDF2PasswordHasher",
    "django.contrib.auth.hashers.PBKDF2SHA1PasswordHasher",
    "django.contrib.auth.hashers.BCryptSHA256PasswordHasher",
]

LANGUAGE_CODE = "en-us"
TIME_ZONE = "UTC"
USE_I18N = True
USE_TZ = True

STATIC_URL = env("STATIC_URL", default="/static/")
STATIC_ROOT = BASE_DIR / "staticfiles"
MEDIA_URL = env("MEDIA_URL", default="/media/")
MEDIA_ROOT = BASE_DIR / "media"
STATICFILES_STORAGE = "whitenoise.storage.CompressedManifestStaticFilesStorage"

DEFAULT_AUTO_FIELD = "django.db.models.BigAutoField"

AUTH_USER_MODEL = "users.User"
SITE_ID = 1

AUTHENTICATION_BACKENDS = [
    "django.contrib.auth.backends.ModelBackend",
    "allauth.account.auth_backends.AuthenticationBackend",
]

ACCOUNT_ADAPTER = "apps.users.adapters.CustomAccountAdapter"
SOCIALACCOUNT_ADAPTER = "apps.users.adapters.CustomSocialAccountAdapter"
ACCOUNT_LOGIN_METHODS = {"email"}
ACCOUNT_SIGNUP_FIELDS = ["email*", "username*", "password1*", "password2*"]
ACCOUNT_EMAIL_VERIFICATION = "none"
SOCIALACCOUNT_EMAIL_VERIFICATION = "none"
SOCIALACCOUNT_AUTO_SIGNUP = True
SOCIALACCOUNT_QUERY_EMAIL = True
SOCIALACCOUNT_STORE_TOKENS = True

GOOGLE_CLIENT_ID = env("GOOGLE_CLIENT_ID", default="")
GOOGLE_CLIENT_SECRET = env("GOOGLE_CLIENT_SECRET", default="")
GOOGLE_CALLBACK_URL = env(
    "GOOGLE_CALLBACK_URL",
    default="http://localhost:3000/auth/google/callback",
)
FORTY_TWO_CLIENT_ID = env("FORTY_TWO_CLIENT_ID", default="")
FORTY_TWO_CLIENT_SECRET = env("FORTY_TWO_CLIENT_SECRET", default="")
FORTY_TWO_REDIRECT_URI = env(
    "FORTY_TWO_REDIRECT_URI",
    default="http://localhost:3000/auth/42/callback",
)
FORTY_TWO_SCOPES = env("FORTY_TWO_SCOPES", default="public")
FRONTEND_URL = env("FRONTEND_URL", default="http://localhost:3000")

SOCIALACCOUNT_PROVIDERS = {
    "google": {
        "APP": {
            "client_id": GOOGLE_CLIENT_ID,
            "secret": GOOGLE_CLIENT_SECRET,
            "key": "",
        },
        "SCOPE": ["profile", "email"],
        "AUTH_PARAMS": {"access_type": "online"},
    }
}

REST_AUTH = {
    "USE_JWT": True,
    "JWT_AUTH_HTTPONLY": False,
    "SESSION_LOGIN": False,
    "TOKEN_MODEL": None,
}

REST_FRAMEWORK = {
    "DEFAULT_AUTHENTICATION_CLASSES": (
        "rest_framework_simplejwt.authentication.JWTAuthentication",
    ),
    "DEFAULT_PERMISSION_CLASSES": ("rest_framework.permissions.IsAuthenticated",),
    "DEFAULT_RENDERER_CLASSES": ("common.renderers.StandardizedJSONRenderer",),
    "EXCEPTION_HANDLER": "common.exceptions.custom_exception_handler",
    "DEFAULT_PAGINATION_CLASS": "common.pagination.StandardResultsSetPagination",
    "DEFAULT_FILTER_BACKENDS": (
        "django_filters.rest_framework.DjangoFilterBackend",
        "rest_framework.filters.OrderingFilter",
        "rest_framework.filters.SearchFilter",
    ),
    "DEFAULT_THROTTLE_CLASSES": (
        "rest_framework.throttling.AnonRateThrottle",
        "rest_framework.throttling.UserRateThrottle",
    ),
    "DEFAULT_THROTTLE_RATES": {
        "anon": "100/minute",
        "user": "1000/minute",
        "auth_login": "10/minute",
        "auth_register": "5/minute",
        "auth_password": "5/minute",
        "bid_user": "30/minute",
        "bid_ip": "60/minute",
    },
    "DEFAULT_SCHEMA_CLASS": "drf_spectacular.openapi.AutoSchema",
}

SPECTACULAR_SETTINGS = {
    "TITLE": "BidLive API",
    "DESCRIPTION": "BidLive public API",
    "VERSION": "1.0.0",
    "SERVE_INCLUDE_SCHEMA": False,
    "SWAGGER_UI_SETTINGS": {
        "persistAuthorization": True,
    },
}

JWT_ACCESS_MINUTES = env.int("JWT_ACCESS_MINUTES", default=15)
JWT_REFRESH_DAYS   = env.int("JWT_REFRESH_DAYS", default=7)

SIMPLE_JWT = {
    "ACCESS_TOKEN_LIFETIME": timedelta(minutes=JWT_ACCESS_MINUTES),
    "REFRESH_TOKEN_LIFETIME": timedelta(days=JWT_REFRESH_DAYS),
    "ROTATE_REFRESH_TOKENS": True,
    "BLACKLIST_AFTER_ROTATION": True,
    "UPDATE_LAST_LOGIN": True,
    "AUTH_HEADER_TYPES": ("Bearer",),
}

CORS_ALLOWED_ORIGINS = [
    origin.strip() for origin in env("CORS_ALLOWED_ORIGINS", default="").split(",") if origin
]
CORS_ALLOW_CREDENTIALS = True

CACHES = {
    "default": {
        "BACKEND": "django.core.cache.backends.redis.RedisCache",
        "LOCATION": env("REDIS_URL", default="redis://localhost:6379/0"),
    }
}

CHANNEL_LAYERS = {
    "default": {
        "BACKEND": "channels_redis.core.RedisChannelLayer",
        "CONFIG": {
            "hosts": [env("REDIS_URL", default="redis://localhost:6379/0")],
        },
    }
}

CELERY_BROKER_URL = env("CELERY_BROKER_URL", default=env("REDIS_URL", default=""))
CELERY_RESULT_BACKEND = env("CELERY_RESULT_BACKEND", default=env("REDIS_URL", default=""))

CELERY_BEAT_SCHEDULE = {
    "auctions-activate-scheduled": {
        "task": "apps.auctions.tasks.activate_auction.activate_scheduled_auctions",
        "schedule": timedelta(minutes=1),
    },
    "auctions-close-expired": {
        "task": "apps.auctions.tasks.close_auction.close_expired_auctions",
        "schedule": timedelta(minutes=1),
    },
    "healthcheck-ping": {
        "task": "apps.domain.tasks.sample_heartbeat",
        "schedule": 60.0,
    },
}

AUCTION_IMAGE_ALLOWED_MIME_TYPES = ["image/jpeg", "image/png", "image/webp"]
AUCTION_IMAGE_MAX_SIZE = 5 * 1024 * 1024
AUCTION_IMAGE_MAX_COUNT = 8
AUCTION_LOCK_TIMEOUT = 10
AUCTION_LOCK_BLOCKING_TIMEOUT = 5
AUCTION_BID_RATE_LIMIT_COUNT = 5
AUCTION_BID_RATE_LIMIT_WINDOW_SECONDS = 10
AUCTION_BID_RATE_LIMIT_BLOCK_SECONDS = 30
AUCTION_BID_COOLDOWN_SECONDS = 0
CELERY_ACCEPT_CONTENT = ["json"]
CELERY_TASK_SERIALIZER = "json"
CELERY_RESULT_SERIALIZER = "json"
CELERY_TIMEZONE = TIME_ZONE
CELERY_TASK_DEFAULT_QUEUE = "default"
CELERY_TASK_ACKS_LATE = True
CELERY_WORKER_PREFETCH_MULTIPLIER = 1
CELERY_WORKER_SEND_TASK_EVENTS = True
CELERY_TASK_SEND_SENT_EVENT = True


LOGGING = {
    "version": 1,
    "disable_existing_loggers": False,
    "formatters": {
        "standard": {
            "format": "%(asctime)s %(levelname)s %(name)s %(message)s",
        },
    },
    "handlers": {
        "console": {
            "class": "logging.StreamHandler",
            "formatter": "standard",
        },
    },
    "root": {
        "handlers": ["console"],
        "level": "INFO",
    },
}

# LiveKit Streaming Settings
LIVEKIT_URL = env("LIVEKIT_URL", default="")
LIVEKIT_PUBLIC_URL = env("LIVEKIT_PUBLIC_URL", default="")
LIVEKIT_API_KEY = env("LIVEKIT_API_KEY", default="")
LIVEKIT_API_SECRET = env("LIVEKIT_API_SECRET", default="")

