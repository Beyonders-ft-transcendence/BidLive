from django.contrib import admin
from django.contrib.auth.admin import UserAdmin as DjangoUserAdmin

from core.users.models import Permission, Role, RolePermission, User, UserRole


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
