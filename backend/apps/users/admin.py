from django.contrib import admin
from django.contrib.auth.admin import UserAdmin as DjangoUserAdmin

from apps.users.models import Permission, PermissionAuditLog, Role, RolePermission, User, UserRole


class UserRoleInline(admin.TabularInline):
    model = UserRole
    extra = 1


class RolePermissionInline(admin.TabularInline):
    model = RolePermission
    extra = 1


@admin.register(User)
class UserAdmin(DjangoUserAdmin):
    ordering = ("email",)
    list_display = ("email", "username", "full_name", "status", "is_verified", "is_staff")
    search_fields = ("email", "username", "full_name")
    list_filter = ("status", "is_verified", "is_online", "is_staff", "is_active")
    inlines = [UserRoleInline]

    fieldsets = (
        (None, {"fields": ("email", "password")}),
        (
            "Profile",
            {
                "fields": (
                    "username",
                    "full_name",
                    "avatar_url",
                    "bio",
                    "status",
                    "is_verified",
                    "is_online",
                    "last_seen",
                    "last_login_ip",
                    "failed_login_attempts",
                    "locked_until",
                )
            },
        ),
        ("Permissions", {"fields": ("is_active", "is_staff", "is_superuser", "groups", "user_permissions")}),
        ("Important dates", {"fields": ("last_login",)}),
    )

    add_fieldsets = (
        (
            None,
            {
                "classes": ("wide",),
                "fields": ("email", "username", "full_name", "password1", "password2"),
            },
        ),
    )


@admin.register(Role)
class RoleAdmin(admin.ModelAdmin):
    list_display = ("name", "created_at")
    search_fields = ("name",)
    inlines = [RolePermissionInline]


@admin.register(Permission)
class PermissionAdmin(admin.ModelAdmin):
    list_display = ("name", "created_at")
    search_fields = ("name",)


@admin.register(PermissionAuditLog)
class PermissionAuditLogAdmin(admin.ModelAdmin):
    list_display = ("action", "actor", "target_user", "resource_type", "resource_id", "created_at")
    list_filter = ("action", "resource_type")
    search_fields = ("action", "resource_id", "actor__email", "target_user__email")
    readonly_fields = ("created_at", "updated_at")
