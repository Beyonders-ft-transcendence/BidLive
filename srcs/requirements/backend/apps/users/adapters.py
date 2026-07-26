from allauth.account.adapter import DefaultAccountAdapter
from allauth.socialaccount.adapter import DefaultSocialAccountAdapter
from rest_framework.exceptions import PermissionDenied

from apps.users.models import UserStatus


class CustomAccountAdapter(DefaultAccountAdapter):
    def is_open_for_signup(self, request):
        return True


class CustomSocialAccountAdapter(DefaultSocialAccountAdapter):
    def is_open_for_signup(self, request, sociallogin):
        return True

    def pre_social_login(self, request, sociallogin):
        if sociallogin.is_existing:
            user = sociallogin.user
            if not user.is_active or user.status in (UserStatus.BANNED, UserStatus.SUSPENDED):
                raise PermissionDenied({"account": ["Conta indisponivel para login."]})
        super().pre_social_login(request, sociallogin)

    def populate_user(self, request, sociallogin, data):
        user = super().populate_user(request, sociallogin, data)
        if not user.full_name and data.get("name"):
            user.full_name = data["name"]
        if not user.avatar_url and data.get("picture"):
            user.avatar_url = data["picture"]
        return user
