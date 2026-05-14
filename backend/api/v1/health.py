from django.core.cache import cache
from django.db import connection
from django.http import JsonResponse


def health_check(request):
    db_ok = True
    cache_ok = True

    try:
        with connection.cursor() as cursor:
            cursor.execute("SELECT 1")
            cursor.fetchone()
    except Exception:
        db_ok = False

    try:
        cache.set("healthcheck", "ok", 1)
        cache_ok = cache.get("healthcheck") == "ok"
    except Exception:
        cache_ok = False

    status = 200 if db_ok and cache_ok else 503

    return JsonResponse(
        {"status": "ok" if status == 200 else "degraded", "db": db_ok, "cache": cache_ok},
        status=status,
    )
