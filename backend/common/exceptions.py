import json
import logging

from django.http import Http404
from rest_framework import status
from rest_framework.exceptions import (
    AuthenticationFailed,
    MethodNotAllowed,
    NotAuthenticated,
    NotFound,
    ParseError,
    PermissionDenied,
    Throttled,
    ValidationError,
)
from rest_framework.response import Response
from rest_framework.views import exception_handler

logger = logging.getLogger(__name__)


def _normalize_detail(detail) -> str:
    if isinstance(detail, list):
        first = detail[0] if detail else "Erro desconhecido."
        return _normalize_detail(first)
    if isinstance(detail, dict):
        first_val = next(iter(detail.values()), "Erro desconhecido.")
        return _normalize_detail(first_val)
    return str(detail)


def custom_exception_handler(exc: Exception, context: dict) -> Response:

    if isinstance(exc, json.JSONDecodeError):
        return Response(
            {"success": False, "errors": {"detail": "JSON inválido ou malformado."}},
            status=status.HTTP_400_BAD_REQUEST,
        )

    if isinstance(exc, Http404):
        return Response(
            {"success": False, "errors": {"detail": "Recurso não encontrado."}},
            status=status.HTTP_404_NOT_FOUND,
        )

    response = exception_handler(exc, context)

    if response is None:
        logger.exception(
            f"Unhandled exception in {context.get('view').__class__.__name__ if context.get('view') else 'unknown'}: {exc}"
        )
        return Response(
            {"success": False, "errors": {"detail": "Erro interno do servidor."}},
            status=status.HTTP_500_INTERNAL_SERVER_ERROR,
        )

    detail = response.data

    if isinstance(exc, Throttled):
        wait = getattr(exc, "wait", None)
        msg = f"Demasiados pedidos. Tente novamente em {int(wait)} segundos." if wait else "Demasiados pedidos."
        response.data = {"success": False, "errors": {"detail": msg}}

    elif isinstance(exc, (NotAuthenticated, AuthenticationFailed)):
        response.data = {"success": False, "errors": {"detail": "Autenticação necessária."}}

    elif isinstance(exc, PermissionDenied):
        response.data = {"success": False, "errors": {"detail": "Não tens permissão para realizar esta acção."}}

    elif isinstance(exc, (NotFound, Http404)):
        response.data = {"success": False, "errors": {"detail": "Recurso não encontrado."}}

    elif isinstance(exc, MethodNotAllowed):
        response.data = {"success": False, "errors": {"detail": f"Método não permitido: {exc.args[0] if exc.args else ''}"}}

    elif isinstance(exc, ParseError):
        response.data = {"success": False, "errors": {"detail": "JSON inválido ou malformado."}}

    elif isinstance(exc, ValidationError):
        response.data = {"success": False, "errors": detail}

    else:
        response.data = {
            "success": False,
            "errors": detail if isinstance(detail, dict) else {"detail": _normalize_detail(detail)},
        }

    return response