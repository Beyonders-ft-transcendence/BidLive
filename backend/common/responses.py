from rest_framework.response import Response


def success_response(data, status_code=200):
    return Response({"success": True, "data": data}, status=status_code)


def error_response(errors, status_code=400):
    return Response({"success": False, "errors": errors}, status=status_code)
