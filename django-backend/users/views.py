from django.contrib.auth.models import User
from rest_framework import permissions, viewsets

from .serializers import UserCreateSerializer, UserSerializer


class UserViewSet(viewsets.ModelViewSet):
    queryset = User.objects.all().order_by('-date_joined')
    permission_classes = [permissions.IsAdminUser]

    def get_serializer_class(self):
        if self.action == 'create':
            return UserCreateSerializer
        return UserSerializer
