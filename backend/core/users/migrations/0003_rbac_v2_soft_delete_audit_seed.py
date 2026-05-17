from django.db import migrations, models

from core.users.constants import ROLE_PERMISSIONS, SYSTEM_PERMISSIONS


def seed_rbac_v2(apps, schema_editor):
    Role = apps.get_model("users", "Role")
    Permission = apps.get_model("users", "Permission")
    RolePermission = apps.get_model("users", "RolePermission")

    for name, description in SYSTEM_PERMISSIONS:
        Permission.objects.get_or_create(name=name, defaults={"description": description})

    for role_name, permission_names in ROLE_PERMISSIONS.items():
        role, _ = Role.objects.get_or_create(
            name=role_name,
            defaults={"description": f"{role_name} system role"},
        )
        for permission_name in permission_names:
            permission = Permission.objects.get(name=permission_name)
            RolePermission.objects.get_or_create(role=role, permission=permission)


def migrate_legacy_user_roles(apps, schema_editor):
    Role = apps.get_model("users", "Role")
    UserRole = apps.get_model("users", "UserRole")

    mapping = {
        "USER": "PERSONAL_USER",
        "ADMIN": "SUPER_ADMIN",
    }
    for old_name, new_name in mapping.items():
        old_role = Role.objects.filter(name=old_name).first()
        new_role = Role.objects.filter(name=new_name).first()
        if old_role and new_role:
            UserRole.objects.filter(role=old_role).update(role=new_role)


class Migration(migrations.Migration):
    dependencies = [
        ("users", "0002_auth_security_and_rbac_seed"),
    ]

    operations = [
        migrations.AddField(
            model_name="user",
            name="is_deleted",
            field=models.BooleanField(default=False),
        ),
        migrations.AddField(
            model_name="user",
            name="deleted_at",
            field=models.DateTimeField(blank=True, null=True),
        ),
        migrations.CreateModel(
            name="PermissionAuditLog",
            fields=[
                ("id", models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name="ID")),
                ("created_at", models.DateTimeField(auto_now_add=True)),
                ("updated_at", models.DateTimeField(auto_now=True)),
                ("action", models.CharField(max_length=100)),
                ("resource_type", models.CharField(blank=True, max_length=50)),
                ("resource_id", models.CharField(blank=True, max_length=64)),
                ("metadata", models.JSONField(blank=True, null=True)),
                ("ip_address", models.CharField(blank=True, max_length=45)),
                (
                    "actor",
                    models.ForeignKey(
                        blank=True,
                        null=True,
                        on_delete=models.SET_NULL,
                        related_name="permission_audit_actions",
                        to="users.user",
                    ),
                ),
                (
                    "target_user",
                    models.ForeignKey(
                        blank=True,
                        null=True,
                        on_delete=models.SET_NULL,
                        related_name="permission_audit_targets",
                        to="users.user",
                    ),
                ),
            ],
            options={
                "verbose_name": "Permission Audit Log",
                "verbose_name_plural": "Permission Audit Logs",
                "db_table": "permission_audit_logs",
                "ordering": ["-created_at"],
                "indexes": [
                    models.Index(fields=["action"], name="idx_perm_audit_action"),
                    models.Index(fields=["resource_type"], name="idx_perm_audit_resource"),
                ],
            },
        ),
        migrations.RunPython(seed_rbac_v2, migrations.RunPython.noop),
        migrations.RunPython(migrate_legacy_user_roles, migrations.RunPython.noop),
    ]
