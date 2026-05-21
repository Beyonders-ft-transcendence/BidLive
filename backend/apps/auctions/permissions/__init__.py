from rest_framework.permissions import BasePermission, SAFE_METHODS

from apps.users.authorization_service import user_has_permission


class IsAuctionOwnerOrManager(BasePermission):
    def has_object_permission(self, request, view, obj):
        if request.method in SAFE_METHODS:
            return True
        if getattr(obj, "item", None) and obj.item.seller_id == request.user.id:
            return True
        if user_has_permission(user=request.user, permission_name="auction.manage"):
            return True
        return bool(request.user and request.user.has_role("admin"))
