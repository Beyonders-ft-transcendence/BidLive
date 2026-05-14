from rest_framework.response import Response


def success_response(data=None, message: str | None = None, status_code=200):
    payload = {"success": True}
    if message:
        payload["message"] = message
    payload["data"] = data if data is not None else {}
    return Response(payload, status=status_code)


def error_response(errors, message: str | None = None, status_code=400):
    payload = {"success": False, "errors": errors}
    if message:
        payload["message"] = message
    return Response(payload, status=status_code)
