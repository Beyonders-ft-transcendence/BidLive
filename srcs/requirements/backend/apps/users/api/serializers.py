from rest_framework import serializers

from apps.users.models import Permission, Role, User, UserStatus


class UserListSerializer(serializers.ModelSerializer):
    roles = serializers.SlugRelatedField(many=True, read_only=True, slug_field="name")

    class Meta:
        model = User
        fields = (
            "id",
            "email",
            "username",
            "full_name",
            "avatar_url",
            "status",
            "is_verified",
            "is_active",
            "roles",
            "created_at",
        )


class UserDetailSerializer(serializers.ModelSerializer):
    roles = serializers.SlugRelatedField(many=True, read_only=True, slug_field="name")
    role_names = serializers.ListField(
        child=serializers.CharField(),
        write_only=True,
        required=False,
    )

    class Meta:
        model = User
        fields = (
            "id",
            "email",
            "username",
            "full_name",
            "avatar_url",
            "bio",
            "status",
            "is_verified",
            "is_active",
            "is_online",
            "roles",
            "role_names",
            "created_at",
            "updated_at",
        )
        read_only_fields = ("id", "is_online", "created_at", "updated_at")


class UserCreateSerializer(serializers.Serializer):
    email = serializers.EmailField()
    username = serializers.CharField(max_length=50)
    full_name = serializers.CharField(max_length=150)
    password = serializers.CharField(write_only=True, min_length=8)
    role_names = serializers.ListField(child=serializers.CharField(), required=False)
    avatar_url = serializers.URLField(required=False, allow_blank=True)
    bio = serializers.CharField(required=False, allow_blank=True)


class UserUpdateSerializer(serializers.Serializer):
    username = serializers.CharField(max_length=50, required=False)
    full_name = serializers.CharField(max_length=150, required=False)
    avatar_url = serializers.URLField(required=False, allow_blank=True)
    bio = serializers.CharField(required=False, allow_blank=True)
    status = serializers.ChoiceField(choices=UserStatus.choices, required=False)
    is_verified = serializers.BooleanField(required=False)
    is_active = serializers.BooleanField(required=False)
    role_names = serializers.ListField(child=serializers.CharField(), required=False)


class UserBanSerializer(serializers.Serializer):
    status = serializers.ChoiceField(choices=UserStatus.choices)


class RoleSerializer(serializers.ModelSerializer):
    permissions = serializers.SerializerMethodField()
    permission_names = serializers.ListField(
        child=serializers.CharField(),
        write_only=True,
        required=False,
    )
    users = serializers.SerializerMethodField()

    class Meta:
        model = Role
        fields = (
            "id",
            "name",
            "description",
            "permissions",
            "permission_names",
            "users",
            "created_at",
            "updated_at",
        )
        read_only_fields = ("id", "created_at", "updated_at")

    def get_permissions(self, obj: Role) -> list[str]:
        return list(
            obj.rolepermission_set.values_list("permission__name", flat=True).order_by(
                "permission__name"
            )
        )

    def get_users(self, obj: Role) -> list[int]:
        if self.context.get("include_users"):
            return list(obj.users.values_list("id", flat=True))
        return []


class RoleWriteSerializer(serializers.Serializer):
    name = serializers.CharField(max_length=50)
    description = serializers.CharField(required=False, allow_blank=True)
    permission_names = serializers.ListField(child=serializers.CharField(), required=False)


class PermissionSerializer(serializers.ModelSerializer):
    roles = serializers.SerializerMethodField()

    class Meta:
        model = Permission
        fields = ("id", "name", "description", "roles", "created_at", "updated_at")
        read_only_fields = ("id", "created_at", "updated_at")

    def get_roles(self, obj: Permission) -> list[str]:
        return list(
            obj.rolepermission_set.values_list("role__name", flat=True).order_by("role__name")
        )


class PermissionWriteSerializer(serializers.Serializer):
    name = serializers.CharField(max_length=100)
    description = serializers.CharField(required=False, allow_blank=True)
