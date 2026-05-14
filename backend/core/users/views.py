from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework.views import APIView

from core.users.serializers import UserSerializer


class UserMeView(APIView):
    permission_classes = [IsAuthenticated]
    serializer_class = UserSerializer

    def get(self, request):
        serializer = UserSerializer(request.user)
        return Response(serializer.data)
