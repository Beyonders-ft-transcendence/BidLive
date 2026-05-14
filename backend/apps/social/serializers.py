from rest_framework import serializers

from apps.social.models import Friendship


class FriendshipSerializer(serializers.ModelSerializer):
    class Meta:
        model = Friendship
        fields = ("id", "requester", "addressee", "status", "created_at")
