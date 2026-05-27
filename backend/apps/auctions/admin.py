from django.contrib import admin

from apps.auctions.models import (
    Auction,
    AuctionAuditLog,
    AuctionCategory,
    AuctionImage,
    AuctionItem,
    Bid,
    LiveStream,
)


@admin.register(AuctionItem)
class AuctionItemAdmin(admin.ModelAdmin):
    list_display = (
        "title",
        "seller",
        "starting_price",
        "current_price",
        "minimum_increment",
        "buy_now_price",
        "created_at",
    )
    search_fields = ("title", "seller__email")
    list_filter = ("condition_type",)


@admin.register(AuctionCategory)
class AuctionCategoryAdmin(admin.ModelAdmin):
    list_display = ("name", "slug", "parent", "is_active", "sort_order")
    search_fields = ("name", "slug")
    list_filter = ("is_active",)


@admin.register(AuctionImage)
class AuctionImageAdmin(admin.ModelAdmin):
    list_display = ("item", "file", "is_primary", "sort_order", "created_at")
    list_filter = ("is_primary",)


@admin.register(Auction)
class AuctionAdmin(admin.ModelAdmin):
    list_display = ("id", "item", "status", "start_time", "end_time", "winner")
    list_filter = ("status",)


@admin.register(Bid)
class BidAdmin(admin.ModelAdmin):
    list_display = ("auction", "bidder", "amount", "is_buy_now", "created_at")


@admin.register(AuctionAuditLog)
class AuctionAuditLogAdmin(admin.ModelAdmin):
    list_display = ("auction", "actor", "action", "created_at")
    search_fields = ("action", "auction__id")


@admin.register(LiveStream)
class LiveStreamAdmin(admin.ModelAdmin):
    list_display = ("stream_key", "auction", "streamer", "is_live")
