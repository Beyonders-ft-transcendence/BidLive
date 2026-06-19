from typing import Any

from rest_framework import status
from rest_framework.response import Response
from rest_framework.views import exception_handler


def custom_exception_handler(exc: Exception, context: dict[str, Any]) -> Response:
    response = exception_handler(exc, context)

    if response is None:
        return Response(
            {"success": False, "errors": [{"detail": "Unexpected error"}]},
            status=status.HTTP_500_INTERNAL_SERVER_ERROR,
        )

    detail = response.data
    response.data = {
        "success": False,
        "errors": detail if isinstance(detail, list) else [detail],
    }
    return response
