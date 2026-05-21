from apps.auctions.api.urls.router import build_router

router = build_router()
urlpatterns = router.urls

__all__ = ["router", "urlpatterns", "build_router"]
