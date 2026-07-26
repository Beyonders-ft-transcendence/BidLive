from django.db import migrations


SYSTEM_PERMISSIONS = [
    ("auction.create", "Create auctions"),
    ("auction.read", "View auctions"),
    ("auction.update", "Update auctions"),
    ("auction.delete", "Delete auctions"),
    ("auction.bid", "Place bids on auctions"),
    ("auction.manage", "Moderate and manage auctions"),
    ("chat.send", "Send chat messages"),
    ("chat.delete", "Delete chat messages"),
    ("chat.moderate", "Moderate chat messages"),
    ("report.create", "Create content reports"),
    ("report.review", "Review content reports"),
    ("report.resolve", "Resolve content reports"),
    ("user.read", "Read user records"),
    ("user.create", "Create user records"),
    ("user.update", "Update user records"),
    ("user.delete", "Delete user records"),
    ("user.ban", "Ban or suspend users"),
    ("user.manage", "Manage user accounts"),
    ("user.promote", "Promote user roles"),
    ("role.manage", "Manage roles"),
    ("permission.manage", "Manage permissions"),
    ("content.hide", "Hide suspicious content"),
    ("content.remove", "Remove suspicious content"),
    ("moderation.alert", "Issue moderation alerts"),
    ("audit.read", "Read audit logs"),
    ("audit.global", "Read global audit logs"),
    ("system.configure", "Configure critical system settings"),
    ("analytics.global", "Read global analytics"),
]

ROLE_DESCRIPTIONS = {
    "VISITOR": "Public access role",
    "USER": "Default authenticated platform user",
    "MONITOR": "Moderation and supervision role",
    "SUPER_ADMIN": "Full platform access role",
}

ROLE_PERMISSIONS = {
    "VISITOR": [
        "auction.read",
    ],
    "USER": [
        "auction.create",
        "auction.read",
        "auction.update",
        "auction.delete",
        "auction.bid",
        "chat.send",
        "report.create",
        "user.read",
        "user.update",
    ],
    "MONITOR": [
        "auction.create",
        "auction.read",
        "auction.update",
        "auction.delete",
        "auction.bid",
        "auction.manage",
        "chat.send",
        "chat.delete",
        "chat.moderate",
        "report.create",
        "report.review",
        "report.resolve",
        "user.read",
        "user.update",
        "user.ban",
        "content.hide",
        "content.remove",
        "moderation.alert",
    ],
    "SUPER_ADMIN": [name for name, _ in SYSTEM_PERMISSIONS],
}

LEGACY_ROLE_MAPPING = {
    "PERSONAL_USER": "USER",
    "BUSINESS_USER": "USER",
    "ADMIN": "SUPER_ADMIN",
}

LEGACY_PERMISSION_NAMES = ("admin.manage", "project.read", "project.write")


def align_rbac_role_types(apps, schema_editor):
    Role = apps.get_model("users", "Role")
    Permission = apps.get_model("users", "Permission")
    RolePermission = apps.get_model("users", "RolePermission")
    UserRole = apps.get_model("users", "UserRole")

    for permission_name, description in SYSTEM_PERMISSIONS:
        Permission.objects.update_or_create(
            name=permission_name,
            defaults={"description": description},
        )

    role_index = {}
    for role_name, description in ROLE_DESCRIPTIONS.items():
        role, _ = Role.objects.update_or_create(
            name=role_name,
            defaults={"description": description},
        )
        role_index[role_name] = role

    for old_name, new_name in LEGACY_ROLE_MAPPING.items():
        old_role = Role.objects.filter(name=old_name).first()
        new_role = role_index.get(new_name)
        if old_role is None or new_role is None or old_role.id == new_role.id:
            continue

        user_ids = UserRole.objects.filter(role=old_role).values_list("user_id", flat=True)
        for user_id in user_ids:
            UserRole.objects.get_or_create(user_id=user_id, role=new_role)

        UserRole.objects.filter(role=old_role).delete()
        RolePermission.objects.filter(role=old_role).delete()
        old_role.delete()

    for role_name, permission_names in ROLE_PERMISSIONS.items():
        role = role_index[role_name]
        permissions = list(Permission.objects.filter(name__in=permission_names))
        RolePermission.objects.filter(role=role).exclude(permission__in=permissions).delete()
        for permission in permissions:
            RolePermission.objects.get_or_create(role=role, permission=permission)

    Permission.objects.filter(name__in=LEGACY_PERMISSION_NAMES).delete()


class Migration(migrations.Migration):
    dependencies = [
        ("users", "0003_rbac_v2_soft_delete_audit_seed"),
    ]

    operations = [
        migrations.RunPython(align_rbac_role_types, migrations.RunPython.noop),
    ]
