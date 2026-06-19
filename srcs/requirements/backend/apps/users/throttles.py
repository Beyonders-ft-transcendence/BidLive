from rest_framework.throttling import ScopedRateThrottle


class AuthLoginThrottle(ScopedRateThrottle):
    scope = "auth_login"


class AuthRegisterThrottle(ScopedRateThrottle):
    scope = "auth_register"


class AuthPasswordThrottle(ScopedRateThrottle):
    scope = "auth_password"
