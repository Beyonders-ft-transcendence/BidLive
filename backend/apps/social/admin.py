from django.contrib import admin

from apps.social.models import Friendship


@admin.register(Friendship)
class FriendshipAdmin(admin.ModelAdmin):
    list_display = ("requester", "addressee", "status", "created_at")
    list_filter = ("status",)
