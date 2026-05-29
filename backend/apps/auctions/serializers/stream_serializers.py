from rest_framework import serializers

from apps.auctions.models import LiveStream, StreamViewer
from apps.auctions.models.streaming import LiveStreamStatus, LiveStreamVisibility
from apps.auctions.serializers.common import FileBriefSerializer
from apps.storage.models import File


class StreamViewerSerializer(serializers.ModelSerializer):
    viewer = serializers.SerializerMethodField()

    class Meta:
        model = StreamViewer
        fields = ("id", "viewer", "joined_at", "last_seen_at")

    def get_viewer(self, obj):
        return {
            "id": obj.viewer_id,
            "username": obj.viewer.username,
            "full_name": getattr(obj.viewer, "full_name", ""),
        }


class LiveStreamBaseSerializer(serializers.ModelSerializer):
    auction_id = serializers.IntegerField(read_only=True)
    streamer = serializers.SerializerMethodField()
    thumbnail = FileBriefSerializer(read_only=True)
    thumbnail_id = serializers.PrimaryKeyRelatedField(
        queryset=File.objects.all(),
        source="thumbnail",
        write_only=True,
        required=False,
        allow_null=True,
    )

    class Meta:
        model = LiveStream
        fields = (
            "id",
            "auction",
            "auction_id",
            "streamer",
            "title",
            "description",
            "thumbnail",
            "thumbnail_id",
            "stream_key",
            "status",
            "visibility",
            "is_live",
            "viewer_count",
            "stream_meta",
            "started_at",
            "ended_at",
            "created_at",
            "updated_at",
        )
        read_only_fields = (
            "id",
            "auction",
            "auction_id",
            "streamer",
            "stream_key",
            "status",
            "is_live",
            "viewer_count",
            "started_at",
            "ended_at",
            "created_at",
            "updated_at",
        )

    def get_streamer(self, obj):
        return {
            "id": obj.streamer_id,
            "username": obj.streamer.username,
            "full_name": getattr(obj.streamer, "full_name", ""),
        }


class StreamListSerializer(LiveStreamBaseSerializer):
    class Meta(LiveStreamBaseSerializer.Meta):
        fields = (
            "id",
            "auction",
            "auction_id",
            "streamer",
            "title",
            "thumbnail",
            "status",
            "visibility",
            "is_live",
            "viewer_count",
            "started_at",
            "ended_at",
            "created_at",
        )


class StreamDetailSerializer(LiveStreamBaseSerializer):
    viewers = StreamViewerSerializer(many=True, read_only=True)

    class Meta(LiveStreamBaseSerializer.Meta):
        fields = LiveStreamBaseSerializer.Meta.fields + ("viewers",)


class StreamCreateSerializer(serializers.Serializer):
    title = serializers.CharField(max_length=255, required=False, allow_blank=True)
    description = serializers.CharField(required=False, allow_blank=True)
    thumbnail_id = serializers.PrimaryKeyRelatedField(
        queryset=File.objects.all(),
        source="thumbnail",
        required=False,
        allow_null=True,
    )
    visibility = serializers.ChoiceField(
        choices=LiveStreamVisibility.choices,
        required=False,
        default=LiveStreamVisibility.PUBLIC,
    )
    status = serializers.ChoiceField(
        choices=LiveStreamStatus.choices,
        required=False,
        default=LiveStreamStatus.READY,
    )
    stream_meta = serializers.JSONField(required=False)


class StreamUpdateSerializer(serializers.Serializer):
    title = serializers.CharField(max_length=255, required=False, allow_blank=True)
    description = serializers.CharField(required=False, allow_blank=True)
    thumbnail_id = serializers.PrimaryKeyRelatedField(
        queryset=File.objects.all(),
        source="thumbnail",
        required=False,
        allow_null=True,
    )
    visibility = serializers.ChoiceField(
        choices=LiveStreamVisibility.choices,
        required=False,
    )
    stream_meta = serializers.JSONField(required=False)


class StreamStartSerializer(serializers.Serializer):
    stream_key = serializers.CharField(required=False, allow_blank=True)
    metadata = serializers.JSONField(required=False)


class StreamEndSerializer(serializers.Serializer):
    reason = serializers.CharField(required=False, allow_blank=True)


class StreamRegenerateKeySerializer(serializers.Serializer):
    pass
