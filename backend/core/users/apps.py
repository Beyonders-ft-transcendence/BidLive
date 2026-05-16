from django.apps import AppConfig


class UsersConfig(AppConfig):
    default_auto_field = "django.db.models.BigAutoField"
    name = "core.users"

    def ready(self):
        import core.users.schema  # noqa: F401
