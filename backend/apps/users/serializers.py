from rest_framework import serializers
from rest_framework.validators import UniqueValidator

from apps.users.models import Permission, Role, User
from common.fields import LocalizedModelSerializer


class PermissionSerializer(LocalizedModelSerializer):
    class Meta:
        model = Permission
        fields = ("id", "name")


class RoleSerializer(LocalizedModelSerializer):
    permissions = PermissionSerializer(many=True, read_only=True)

    class Meta:
        model = Role
        fields = ("id", "name", "permissions")


class UserSerializer(LocalizedModelSerializer):
    roles = RoleSerializer(many=True, read_only=True)

    class Meta:
        model = User
        fields = (
            "id",
            "email",
            "username",
            "full_name",
            "status",
            "is_verified",
            "roles",
            "created_at",
        )


class AuthUserSerializer(LocalizedModelSerializer):
    roles = serializers.ListField(child=serializers.CharField(), read_only=True)
    permissions = serializers.ListField(child=serializers.CharField(), read_only=True)

    class Meta:
        model = User
        fields = (
            "id",
            "email",
            "username",
            "full_name",
            "avatar_url",
            "bio",
            "is_verified",
            "roles",
            "permissions",
        )


class EmptyDataSerializer(serializers.Serializer):
    pass


class AuthTokenDataSerializer(serializers.Serializer):
    access_token = serializers.CharField()
    refresh_token = serializers.CharField()
    token_type = serializers.CharField()
    expires_in = serializers.IntegerField()
    user = AuthUserSerializer()


class SwaggerOAuth2TokenRequestSerializer(serializers.Serializer):
    grant_type = serializers.CharField(required=False, default="password")
    username = serializers.CharField()
    password = serializers.CharField(write_only=True)
    scope = serializers.CharField(required=False, allow_blank=True)
    client_id = serializers.CharField(required=False, allow_blank=True)
    client_secret = serializers.CharField(required=False, allow_blank=True, write_only=True)


class SwaggerOAuth2TokenResponseSerializer(serializers.Serializer):
    access_token = serializers.CharField()
    token_type = serializers.CharField()
    expires_in = serializers.IntegerField()
    refresh_token = serializers.CharField()


class RegisterResponseSerializer(serializers.Serializer):
    success = serializers.BooleanField(default=True)
    message = serializers.CharField()
    data = UserSerializer()


class LoginResponseSerializer(serializers.Serializer):
    success = serializers.BooleanField(default=True)
    message = serializers.CharField()
    data = AuthTokenDataSerializer()


class EmptySuccessResponseSerializer(serializers.Serializer):
    success = serializers.BooleanField(default=True)
    message = serializers.CharField()
    data = EmptyDataSerializer()


class UserMeResponseSerializer(serializers.Serializer):
    success = serializers.BooleanField(default=True)
    message = serializers.CharField()
    data = UserSerializer()



class RegisterSerializer(serializers.Serializer):
    email = serializers.EmailField(
        validators=[
            UniqueValidator(
                queryset=User.objects.all(), message="Este e-mail ja esta em uso."
            )
        ]
    )
    username = serializers.CharField(
        max_length=50,
        validators=[
            UniqueValidator(
                queryset=User.objects.all(), message="Este username ja esta em uso."
            )
        ],
    )
    full_name = serializers.CharField(max_length=150)
    password = serializers.CharField(write_only=True, min_length=8)


class LoginSerializer(serializers.Serializer):
    email = serializers.EmailField()
    password = serializers.CharField(write_only=True)


class RefreshSerializer(serializers.Serializer):
    refresh_token = serializers.CharField()


class LogoutSerializer(serializers.Serializer):
    refresh_token = serializers.CharField(required=False, allow_blank=False)


class ChangePasswordSerializer(serializers.Serializer):
    current_password = serializers.CharField(write_only=True)
    new_password = serializers.CharField(write_only=True, min_length=8)


class ForgotPasswordSerializer(serializers.Serializer):
    email = serializers.EmailField()


class VerifyUserSerializer(serializers.Serializer):
    uid = serializers.CharField()
    token = serializers.CharField()


class ResetPasswordSerializer(serializers.Serializer):
    uid = serializers.CharField()
    token = serializers.CharField()
    new_password = serializers.CharField(write_only=True, min_length=8)


class GoogleLoginSerializer(serializers.Serializer):
    access_token = serializers.CharField(required=False)
    id_token = serializers.CharField(required=False)

    def validate(self, attrs):
        if not attrs.get("access_token") and not attrs.get("id_token"):
            raise serializers.ValidationError(
                "Informe access_token ou id_token retornado pelo Google."
            )
        return attrs


class GoogleCallbackSerializer(serializers.Serializer):
    code = serializers.CharField()
    redirect_uri = serializers.CharField(required=False, allow_blank=True)


class FortyTwoAuthorizeDataSerializer(serializers.Serializer):
    authorization_url = serializers.URLField()
    state = serializers.CharField()
    expires_in = serializers.IntegerField()


class FortyTwoAuthorizeResponseSerializer(serializers.Serializer):
    success = serializers.BooleanField(default=True)
    message = serializers.CharField()
    data = FortyTwoAuthorizeDataSerializer()


class FortyTwoCallbackSerializer(serializers.Serializer):
    code = serializers.CharField()
    state = serializers.CharField()
    redirect_uri = serializers.CharField(required=False, allow_blank=True)
