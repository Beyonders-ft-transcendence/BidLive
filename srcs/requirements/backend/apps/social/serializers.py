from rest_framework import serializers

from apps.social.models import Friendship
from apps.users.models import User
from common.fields import LocalizedModelSerializer


class PublicUserSerializer(LocalizedModelSerializer):
    class Meta:
        model = User
        fields = (
            "id",
            "username",
            "full_name",
            "avatar_url",
            "bio",
            "is_online",
            "is_verified",
            "last_seen",
        )
        read_only_fields = fields


class FriendshipSerializer(LocalizedModelSerializer):
    requester = PublicUserSerializer(read_only=True)
    addressee = PublicUserSerializer(read_only=True)

    class Meta:
        model = Friendship
        fields = (
            "id",
            "requester",
            "addressee",
            "status",
            "created_at",
            "updated_at"
            )
        read_only_fields = fields


class FriendshipCreateSerializer(serializers.Serializer):
	addressee_id = serializers.IntegerField()

	def validate_addressee_id(self, value: int) -> User:
		try:
			return User.objects.get(id=value, is_active=True, is_deleted=False)
		except User.DoesNotExist:
			raise serializers.ValidationError("Utilizador não encontrado.")
