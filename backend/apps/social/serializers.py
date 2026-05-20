from rest_framework import serializers

from apps.social.models import Friendship
from apps.users.models import User

class FriendshipSerializer(serializers.ModelSerializer):
    class Meta:
        model = Friendship
        fields = ("id", "requester", "addressee", "status", "created_at")


class PublicUserSerializer(serializers.ModelSerializer):
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

