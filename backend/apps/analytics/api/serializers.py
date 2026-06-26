from rest_framework import serializers

class IngestEventSerializer(serializers.Serializer):
    event_type = serializers.CharField(max_length=100)
    metadata = serializers.DictField(required=False, default=dict)
