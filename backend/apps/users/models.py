from django.contrib.auth.models import AbstractBaseUser, PermissionsMixin
from django.db import models

from common.models import SoftDeleteModel, TimeStampedModel
from apps.users.managers import UserAllObjectsManager, UserManager


class UserStatus(models.TextChoices):
    ACTIVE = "ACTIVE", "Active"
    BANNED = "BANNED", "Banned"
    SUSPENDED = "SUSPENDED", "Suspended"


class User(TimeStampedModel, SoftDeleteModel, AbstractBaseUser, PermissionsMixin):
    email = models.EmailField(unique=True)
    username = models.CharField(max_length=50, unique=True)
    full_name = models.CharField(max_length=150)
    avatar_url = models.URLField(blank=True)
    bio = models.TextField(blank=True)
    is_verified = models.BooleanField(default=False)
    is_online = models.BooleanField(default=False)
    status = models.CharField(max_length=20, choices=UserStatus.choices, default=UserStatus.ACTIVE)
    last_seen = models.DateTimeField(null=True, blank=True)
    last_login_ip = models.CharField(max_length=45, blank=True)
    failed_login_attempts = models.PositiveSmallIntegerField(default=0)
    locked_until = models.DateTimeField(null=True, blank=True)
    is_active = models.BooleanField(default=True)
    is_staff = models.BooleanField(default=False)
    roles = models.ManyToManyField("Role", through="UserRole", related_name="users", blank=True)

    objects = UserManager()
    all_objects = UserAllObjectsManager()  # includes soft-deleted — use only for restore checks

    USERNAME_FIELD = "email"
    REQUIRED_FIELDS = ["username", "full_name"]

    class Meta:
        db_table = "users"
        verbose_name = "User"
        verbose_name_plural = "Users"
        ordering = ["-created_at"]
        indexes = [
            models.Index(fields=["email"], name="idx_users_email"),
            models.Index(fields=["status"], name="idx_users_status"),
        ]

    def __str__(self) -> str:
        return self.email

    def has_role(self, role_name: str) -> bool:
        return self.roles.filter(name=role_name).exists()

    def clean(self) -> None:
        super().clean()
        if self.email:
            self.email = self.__class__.objects.normalize_email(self.email)


class Role(TimeStampedModel):
    name = models.CharField(max_length=50, unique=True)
    description = models.TextField(blank=True)
    permissions = models.ManyToManyField(
        "Permission", through="RolePermission", related_name="roles", blank=True
    )

    class Meta:
        db_table = "roles"
        verbose_name = "Role"
        verbose_name_plural = "Roles"
        ordering = ["name"]

    def __str__(self) -> str:
        return self.name


class Permission(TimeStampedModel):
    name = models.CharField(max_length=100, unique=True)
    description = models.TextField(blank=True)

    class Meta:
        db_table = "permissions"
        verbose_name = "Permission"
        verbose_name_plural = "Permissions"
        ordering = ["name"]

    def __str__(self) -> str:
        return self.name


class RolePermission(TimeStampedModel):
    role = models.ForeignKey(Role, on_delete=models.CASCADE)
    permission = models.ForeignKey(Permission, on_delete=models.CASCADE)

    class Meta:
        db_table = "role_permissions"
        verbose_name = "Role Permission"
        verbose_name_plural = "Role Permissions"
        constraints = [
            models.UniqueConstraint(fields=["role", "permission"], name="uniq_role_permission")
        ]


class UserRole(TimeStampedModel):
    user = models.ForeignKey("User", on_delete=models.CASCADE)
    role = models.ForeignKey(Role, on_delete=models.CASCADE)

    class Meta:
        db_table = "user_roles"
        verbose_name = "User Role"
        verbose_name_plural = "User Roles"
        constraints = [models.UniqueConstraint(fields=["user", "role"], name="uniq_user_role")]


class PermissionAuditLog(TimeStampedModel):
    actor = models.ForeignKey(
        "User",
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name="permission_audit_actions",
    )
    target_user = models.ForeignKey(
        "User",
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name="permission_audit_targets",
    )
    action = models.CharField(max_length=100)
    resource_type = models.CharField(max_length=50, blank=True)
    resource_id = models.CharField(max_length=64, blank=True)
    metadata = models.JSONField(null=True, blank=True)
    ip_address = models.CharField(max_length=45, blank=True)

    class Meta:
        db_table = "permission_audit_logs"
        verbose_name = "Permission Audit Log"
        verbose_name_plural = "Permission Audit Logs"
        ordering = ["-created_at"]
        indexes = [
            models.Index(fields=["action"], name="idx_perm_audit_action"),
            models.Index(fields=["resource_type"], name="idx_perm_audit_resource"),
        ]
