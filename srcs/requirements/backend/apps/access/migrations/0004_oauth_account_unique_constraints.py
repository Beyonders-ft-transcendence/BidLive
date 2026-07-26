from django.db import migrations, models


class Migration(migrations.Migration):
    dependencies = [
        ("access", "0003_session_security_fields"),
    ]

    operations = [
        migrations.AddConstraint(
            model_name="oauthaccount",
            constraint=models.UniqueConstraint(
                fields=("provider", "provider_user_id"),
                name="uniq_oauth_provider_user",
            ),
        ),
        migrations.AddConstraint(
            model_name="oauthaccount",
            constraint=models.UniqueConstraint(
                fields=("user", "provider"),
                name="uniq_oauth_user_provider",
            ),
        ),
    ]
