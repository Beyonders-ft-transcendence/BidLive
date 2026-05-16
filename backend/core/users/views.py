from drf_spectacular.utils import OpenApiExample, OpenApiResponse, extend_schema, inline_serializer
from rest_framework import serializers as drf_serializers
from rest_framework import status
from rest_framework.exceptions import PermissionDenied, ValidationError
from rest_framework.permissions import IsAuthenticated
from rest_framework.views import APIView

from common.responses import error_response, success_response
from core.users.permissions import HasRBACPermission
from core.users.serializers import (
    ChangePasswordSerializer,
    EmptySuccessResponseSerializer,
    ForgotPasswordSerializer,
    LoginResponseSerializer,
    LoginSerializer,
    LogoutSerializer,
    RefreshSerializer,
    RegisterResponseSerializer,
    RegisterSerializer,
    ResetPasswordSerializer,
    UserMeResponseSerializer,
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


AUTH_ERROR_RESPONSE = inline_serializer(
    name="AuthErrorResponse",
    fields={
        "success": drf_serializers.BooleanField(default=False),
        "message": drf_serializers.CharField(required=False),
        "errors": drf_serializers.ListField(child=drf_serializers.DictField()),
    },
)

AUTH_TAGS = ["auth"]


class UserMeView(APIView):
    permission_classes = [IsAuthenticated]
    serializer_class = UserSerializer

    @extend_schema(
        tags=AUTH_TAGS,
        summary="Obter usuario autenticado",
        description="Retorna o perfil, os papeis e as permissoes do usuario autenticado.",
        responses={
            200: OpenApiResponse(
                response=UserMeResponseSerializer,
                description="Usuario autenticado retornado com sucesso.",
            ),
            401: OpenApiResponse(
                response=AUTH_ERROR_RESPONSE,
                description="Token JWT de acesso ausente ou invalido.",
            ),
        },
        examples=[
            OpenApiExample(
                "Resposta do usuario autenticado",
                value={
                    "success": True,
                    "message": "Usuario autenticado.",
                    "data": {
                        "id": 1,
                        "email": "user@email.com",
                        "username": "user",
                        "full_name": "User Name",
                        "status": "active",
                        "is_verified": False,
                        "roles": [],
                        "created_at": "2026-05-16T12:00:00Z",
                    },
                },
                response_only=True,
                status_codes=["200"],
            )
        ],
    )
    def get(self, request):
        serializer = UserSerializer(request.user)
        return success_response(serializer.data, message="Usuario autenticado.")


class RegisterView(APIView):
    permission_classes = []
    authentication_classes = []
    throttle_classes = [AuthRegisterThrottle]
    serializer_class = RegisterSerializer

    @extend_schema(
        tags=AUTH_TAGS,
        summary="Cadastrar usuario",
        description="Cria uma nova conta de usuario e atribui o papel padrao.",
        auth=[],
        request=RegisterSerializer,
        responses={
            201: OpenApiResponse(
                response=RegisterResponseSerializer,
                description="Usuario cadastrado com sucesso.",
            ),
            400: OpenApiResponse(
                response=AUTH_ERROR_RESPONSE,
                description="Erro de validacao, como email duplicado ou senha fraca.",
            ),
            429: OpenApiResponse(
                response=AUTH_ERROR_RESPONSE,
                description="Limite de tentativas de cadastro excedido.",
            ),
        },
        examples=[
            OpenApiExample(
                "Requisicao de cadastro",
                value={
                    "email": "user@email.com",
                    "username": "user",
                    "full_name": "User Name",
                    "password": "StrongPassword123",
                },
                request_only=True,
            ),
            OpenApiExample(
                "Resposta de cadastro",
                value={
                    "success": True,
                    "message": "Cadastro realizado com sucesso.",
                    "data": {
                        "id": 1,
                        "email": "user@email.com",
                        "username": "user",
                        "full_name": "User Name",
                        "status": "active",
                        "is_verified": False,
                        "roles": [],
                        "created_at": "2026-05-16T12:00:00Z",
                    },
                },
                response_only=True,
                status_codes=["201"],
            ),
        ],
    )
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
    serializer_class = LoginSerializer

    @extend_schema(
        tags=AUTH_TAGS,
        summary="Login",
        description=(
            "Autentica um usuario com email e senha e retorna tokens JWT de acesso e refresh."
        ),
        auth=[],
        request=LoginSerializer,
        responses={
            200: OpenApiResponse(
                response=LoginResponseSerializer,
                description="Login realizado com sucesso.",
            ),
            400: OpenApiResponse(
                response=AUTH_ERROR_RESPONSE,
                description="Credenciais invalidas ou corpo da requisicao malformado.",
            ),
            403: OpenApiResponse(
                response=AUTH_ERROR_RESPONSE,
                description="Conta desativada, suspensa, banida ou temporariamente bloqueada.",
            ),
            429: OpenApiResponse(
                response=AUTH_ERROR_RESPONSE,
                description="Limite de tentativas de login excedido.",
            ),
        },
        examples=[
            OpenApiExample(
                "Requisicao de login",
                value={"email": "user@email.com", "password": "StrongPassword123"},
                request_only=True,
            ),
            OpenApiExample(
                "Resposta de login",
                value={
                    "success": True,
                    "message": "Login realizado com sucesso.",
                    "data": {
                        "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
                        "refresh_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
                        "token_type": "Bearer",
                        "expires_in": 900,
                        "user": {
                            "id": 1,
                            "email": "user@email.com",
                            "username": "user",
                            "full_name": "User Name",
                            "avatar_url": "",
                            "bio": "",
                            "is_verified": False,
                            "roles": ["USER"],
                            "permissions": ["auction.bid"],
                        },
                    },
                },
                response_only=True,
                status_codes=["200"],
            ),
            OpenApiExample(
                "Credenciais invalidas",
                value={
                    "success": False,
                    "message": "Credenciais invalidas.",
                    "errors": [{"credentials": ["Email ou password invalidos."]}],
                },
                response_only=True,
                status_codes=["400"],
            ),
        ],
    )
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
    serializer_class = RefreshSerializer

    @extend_schema(
        tags=AUTH_TAGS,
        summary="Renovar tokens JWT",
        description="Rotaciona um refresh token valido e retorna um novo par de tokens.",
        auth=[],
        request=RefreshSerializer,
        responses={
            200: OpenApiResponse(
                response=LoginResponseSerializer,
                description="Tokens renovados com sucesso.",
            ),
            400: OpenApiResponse(
                response=AUTH_ERROR_RESPONSE,
                description="Refresh token ausente, malformado, expirado ou revogado.",
            ),
            429: OpenApiResponse(
                response=AUTH_ERROR_RESPONSE,
                description="Limite de tentativas de refresh excedido.",
            ),
        },
        examples=[
            OpenApiExample(
                "Requisicao de refresh",
                value={"refresh_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."},
                request_only=True,
            ),
            OpenApiExample(
                "Refresh token invalido",
                value={
                    "success": False,
                    "message": "Refresh token invalido.",
                    "errors": [{"refresh_token": ["Refresh token invalido."]}],
                },
                response_only=True,
                status_codes=["400"],
            ),
        ],
    )
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
    serializer_class = LogoutSerializer

    @extend_schema(
        tags=AUTH_TAGS,
        summary="Logout",
        description=(
            "Revoga o refresh token informado para o usuario autenticado. "
            "Se nenhum refresh token for enviado, todas as sessoes ativas do usuario sao revogadas."
        ),
        request=LogoutSerializer,
        responses={
            200: OpenApiResponse(
                response=EmptySuccessResponseSerializer,
                description="Logout realizado com sucesso.",
            ),
            400: OpenApiResponse(
                response=AUTH_ERROR_RESPONSE,
                description="Refresh token invalido.",
            ),
            401: OpenApiResponse(
                response=AUTH_ERROR_RESPONSE,
                description="Token JWT de acesso ausente ou invalido.",
            ),
        },
        examples=[
            OpenApiExample(
                "Requisicao de logout",
                value={"refresh_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."},
                request_only=True,
            ),
            OpenApiExample(
                "Resposta de logout",
                value={
                    "success": True,
                    "message": "Logout realizado com sucesso.",
                    "data": {},
                },
                response_only=True,
                status_codes=["200"],
            ),
        ],
    )
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
    serializer_class = ChangePasswordSerializer

    @extend_schema(
        tags=AUTH_TAGS,
        summary="Alterar senha",
        description=(
            "Altera a senha do usuario autenticado apos validar a senha atual."
        ),
        request=ChangePasswordSerializer,
        responses={
            200: OpenApiResponse(
                response=EmptySuccessResponseSerializer,
                description="Senha alterada com sucesso.",
            ),
            400: OpenApiResponse(
                response=AUTH_ERROR_RESPONSE,
                description="Erro de validacao ou senha atual invalida.",
            ),
            401: OpenApiResponse(
                response=AUTH_ERROR_RESPONSE,
                description="Token JWT de acesso ausente ou invalido.",
            ),
            429: OpenApiResponse(
                response=AUTH_ERROR_RESPONSE,
                description="Limite de tentativas de senha excedido.",
            ),
        },
        examples=[
            OpenApiExample(
                "Requisicao de alteracao de senha",
                value={
                    "current_password": "OldStrongPassword123",
                    "new_password": "NewStrongPassword123",
                },
                request_only=True,
            ),
            OpenApiExample(
                "Senha atual incorreta",
                value={
                    "success": False,
                    "errors": [{"current_password": ["Password atual invalido."]}],
                },
                response_only=True,
                status_codes=["400"],
            ),
        ],
    )
    def post(self, request):
        serializer = ChangePasswordSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        change_user_password(user=request.user, **serializer.validated_data)
        return success_response({}, message="Senha alterada com sucesso.")


class ForgotPasswordView(APIView):
    permission_classes = []
    authentication_classes = []
    throttle_classes = [AuthPasswordThrottle]
    serializer_class = ForgotPasswordSerializer

    @extend_schema(
        tags=AUTH_TAGS,
        summary="Solicitar redefinicao de senha",
        description=(
            "Inicia o fluxo de redefinicao de senha. A resposta e intencionalmente igual "
            "mesmo quando o email nao existe."
        ),
        auth=[],
        request=ForgotPasswordSerializer,
        responses={
            200: OpenApiResponse(
                response=EmptySuccessResponseSerializer,
                description="Solicitacao de redefinicao aceita para processamento.",
            ),
            400: OpenApiResponse(
                response=AUTH_ERROR_RESPONSE,
                description="Email malformado ou corpo da requisicao invalido.",
            ),
            429: OpenApiResponse(
                response=AUTH_ERROR_RESPONSE,
                description="Limite de tentativas de redefinicao excedido.",
            ),
        },
        examples=[
            OpenApiExample(
                "Requisicao de recuperacao de senha",
                value={"email": "user@email.com"},
                request_only=True,
            ),
            OpenApiExample(
                "Resposta de recuperacao de senha",
                value={
                    "success": True,
                    "message": "Se o email existir, enviaremos as instrucoes de recuperacao.",
                    "data": {},
                },
                response_only=True,
                status_codes=["200"],
            ),
        ],
    )
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
    serializer_class = ResetPasswordSerializer

    @extend_schema(
        tags=AUTH_TAGS,
        summary="Redefinir senha",
        description=(
            "Redefine a senha do usuario usando o uid e o token gerados no fluxo de recuperacao."
        ),
        auth=[],
        request=ResetPasswordSerializer,
        responses={
            200: OpenApiResponse(
                response=EmptySuccessResponseSerializer,
                description="Senha redefinida com sucesso.",
            ),
            400: OpenApiResponse(
                response=AUTH_ERROR_RESPONSE,
                description="Uid, token, senha ou corpo da requisicao invalido.",
            ),
            429: OpenApiResponse(
                response=AUTH_ERROR_RESPONSE,
                description="Limite de tentativas de redefinicao excedido.",
            ),
        },
        examples=[
            OpenApiExample(
                "Requisicao de redefinicao de senha",
                value={
                    "uid": "MQ",
                    "token": "c9o3yy-7a17cc18f4f6b0c0f18f705f8f0f7d3c",
                    "new_password": "NewStrongPassword123",
                },
                request_only=True,
            ),
            OpenApiExample(
                "Token de redefinicao invalido",
                value={
                    "success": False,
                    "errors": [{"token": ["Token de redefinicao invalido."]}],
                },
                response_only=True,
                status_codes=["400"],
            ),
        ],
    )
    def post(self, request):
        serializer = ResetPasswordSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        reset_user_password(**serializer.validated_data)
        return success_response({}, message="Senha redefinida com sucesso.")


class AdminProtectedView(APIView):
    permission_classes = [IsAuthenticated, HasRBACPermission]
    required_permissions = ["admin.manage"]
