from rest_framework import status
from rest_framework.exceptions import PermissionDenied, ValidationError
from rest_framework.permissions import IsAuthenticated
from rest_framework.views import APIView

from common.responses import error_response, success_response
from core.users.permissions import HasRBACPermission
from core.users.serializers import (
    ChangePasswordSerializer,
    ForgotPasswordSerializer,
    LoginSerializer,
    LogoutSerializer,
    RefreshSerializer,
    RegisterSerializer,
    ResetPasswordSerializer,
    UserSerializer,
)
from core.users.services import (
    authenticate_user,
    change_user_password,
    create_user,
    logout_user,
    refresh_user_tokens,
    request_password_reset,
    reset_user_password,
)
from core.users.throttles import AuthLoginThrottle, AuthPasswordThrottle, AuthRegisterThrottle


def _client_ip(request) -> str:
    forwarded_for = request.META.get("HTTP_X_FORWARDED_FOR", "")
    if forwarded_for:
        return forwarded_for.split(",")[0].strip()
    return request.META.get("REMOTE_ADDR", "")


class UserMeView(APIView):
    permission_classes = [IsAuthenticated]
    serializer_class = UserSerializer

    def get(self, request):
        serializer = UserSerializer(request.user)
        return success_response(serializer.data, message="Usuario autenticado.")


class RegisterView(APIView):
    permission_classes = []
    authentication_classes = []
    throttle_classes = [AuthRegisterThrottle]

    def post(self, request):
        serializer = RegisterSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        user = create_user(**serializer.validated_data)
        payload = UserSerializer(user).data
        return success_response(
            payload,
            message="Cadastro realizado com sucesso.",
            status_code=status.HTTP_201_CREATED,
        )


class LoginView(APIView):
    permission_classes = []
    authentication_classes = []
    throttle_classes = [AuthLoginThrottle]

    def post(self, request):
        serializer = LoginSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        try:
            payload = authenticate_user(
                **serializer.validated_data,
                ip_address=_client_ip(request),
                user_agent=request.META.get("HTTP_USER_AGENT", ""),
            )
        except ValidationError as exc:
            return error_response(
                exc.detail,
                message="Credenciais invalidas.",
                status_code=status.HTTP_400_BAD_REQUEST,
            )
        except PermissionDenied as exc:
            return error_response(
                exc.detail,
                message="Conta indisponivel para login.",
                status_code=status.HTTP_403_FORBIDDEN,
            )
        return success_response(payload, message="Login realizado com sucesso.")


class RefreshView(APIView):
    permission_classes = []
    authentication_classes = []
    throttle_classes = [AuthLoginThrottle]

    def post(self, request):
        serializer = RefreshSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        try:
            payload = refresh_user_tokens(
                refresh_token=serializer.validated_data["refresh_token"],
                ip_address=_client_ip(request),
                user_agent=request.META.get("HTTP_USER_AGENT", ""),
            )
        except ValidationError as exc:
            return error_response(
                exc.detail,
                message="Refresh token invalido.",
                status_code=status.HTTP_400_BAD_REQUEST,
            )
        return success_response(payload, message="Token renovado com sucesso.")


class LogoutView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request):
        serializer = LogoutSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        try:
            logout_user(
                user=request.user,
                refresh_token=serializer.validated_data.get("refresh_token"),
                ip_address=_client_ip(request),
            )
        except ValidationError as exc:
            return error_response(
                exc.detail,
                message="Refresh token invalido.",
                status_code=status.HTTP_400_BAD_REQUEST,
            )
        return success_response({}, message="Logout realizado com sucesso.")


class ChangePasswordView(APIView):
    permission_classes = [IsAuthenticated]
    throttle_classes = [AuthPasswordThrottle]

    def post(self, request):
        serializer = ChangePasswordSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        change_user_password(user=request.user, **serializer.validated_data)
        return success_response({}, message="Senha alterada com sucesso.")


class ForgotPasswordView(APIView):
    permission_classes = []
    authentication_classes = []
    throttle_classes = [AuthPasswordThrottle]

    def post(self, request):
        serializer = ForgotPasswordSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        request_password_reset(
            email=serializer.validated_data["email"],
            request_origin=request.META.get("HTTP_ORIGIN", ""),
        )
        return success_response(
            {},
            message="Se o email existir, enviaremos as instrucoes de recuperacao.",
        )


class ResetPasswordView(APIView):
    permission_classes = []
    authentication_classes = []
    throttle_classes = [AuthPasswordThrottle]

    def post(self, request):
        serializer = ResetPasswordSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        reset_user_password(**serializer.validated_data)
        return success_response({}, message="Senha redefinida com sucesso.")


class AdminProtectedView(APIView):
    permission_classes = [IsAuthenticated, HasRBACPermission]
    required_permissions = ["admin.manage"]
