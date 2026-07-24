from django.db import migrations

def add_missing_permissions(apps, schema_editor):
    Role = apps.get_model("users", "Role")
    Permission = apps.get_model("users", "Permission")
    RolePermission = apps.get_model("users", "RolePermission")

    new_perms = [
        ("auction.buy_now", "Buy auction items immediately"),
        ("auction.cancel", "Cancel auctions"),
        ("auction.watch", "Watch/favourite auctions"),
    ]
    
    for perm_name, desc in new_perms:
        Permission.objects.get_or_create(name=perm_name, defaults={"description": desc})
        
    updates = {
        "USER": ["auction.buy_now", "auction.watch"],
        "MONITOR": ["auction.buy_now", "auction.cancel", "auction.watch"],
    }
    
    for role_name, perms in updates.items():
        role = Role.objects.filter(name=role_name).first()
        if role:
            for perm_name in perms:
                permission = Permission.objects.filter(name=perm_name).first()
                if permission:
                    RolePermission.objects.get_or_create(role=role, permission=permission)

class Migration(migrations.Migration):
    dependencies = [
        ("users", "0004_rbac_role_types_alignment"),
    ]

    operations = [
        migrations.RunPython(add_missing_permissions, migrations.RunPython.noop),
    ]
