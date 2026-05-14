from django.contrib import admin

from apps.auctions.models import Auction, AuctionItem, Bid, LiveStream


@admin.register(AuctionItem)
class AuctionItemAdmin(admin.ModelAdmin):
    list_display = ("title", "seller", "starting_price", "current_price", "created_at")
    search_fields = ("title", "seller__email")
    list_filter = ("condition_type",)


@admin.register(Auction)
class AuctionAdmin(admin.ModelAdmin):
    list_display = ("id", "item", "status", "start_time", "end_time")
    list_filter = ("status",)


@admin.register(Bid)
class BidAdmin(admin.ModelAdmin):
    list_display = ("auction", "bidder", "amount", "created_at")


@admin.register(LiveStream)
class LiveStreamAdmin(admin.ModelAdmin):
    list_display = ("stream_key", "auction", "streamer", "is_live")
