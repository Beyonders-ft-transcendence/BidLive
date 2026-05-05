from django.core.cache import cache
from rest_framework import viewsets
from rest_framework.response import Response

from .models import Item
from .serializers import ItemSerializer


class ItemViewSet(viewsets.ModelViewSet):
    queryset = Item.objects.all()
    serializer_class = ItemSerializer

    def list(self, request, *args, **kwargs):
        cache_key = "items:list"
        cached = cache.get(cache_key)

        if cached is not None:
            return Response(cached)

        response = super().list(request, *args, **kwargs)
        cache.set(cache_key, response.data, timeout=30)
        return response

    def create(self, request, *args, **kwargs):
        cache.delete("items:list")
        return super().create(request, *args, **kwargs)

    def update(self, request, *args, **kwargs):
        cache.delete("items:list")
        return super().update(request, *args, **kwargs)

    def partial_update(self, request, *args, **kwargs):
        cache.delete("items:list")
        return super().partial_update(request, *args, **kwargs)

    def destroy(self, request, *args, **kwargs):
        cache.delete("items:list")
        return super().destroy(request, *args, **kwargs)
