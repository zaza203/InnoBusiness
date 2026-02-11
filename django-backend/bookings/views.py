from rest_framework import permissions, status, viewsets
from rest_framework.decorators import action
from rest_framework.response import Response

from .models import Booking, Resource
from .serializers import (
    BookingCreateSerializer,
    BookingSerializer,
    BookingStatusSerializer,
    ResourceSerializer,
)


class ResourceViewSet(viewsets.ModelViewSet):
    queryset = Resource.objects.all().order_by('-created_at')
    serializer_class = ResourceSerializer
    permission_classes = [permissions.IsAuthenticated]


class BookingViewSet(viewsets.ModelViewSet):
    queryset = Booking.objects.select_related('resource', 'requested_by').all().order_by('start_at')
    permission_classes = [permissions.IsAuthenticated]

    def get_serializer_class(self):
        if self.action == 'create':
            return BookingCreateSerializer
        if self.action == 'set_status':
            return BookingStatusSerializer
        return BookingSerializer

    def perform_create(self, serializer):
        serializer.save(requested_by=self.request.user)

    @action(methods=['patch'], detail=True, url_path='status')
    def set_status(self, request, *args, **kwargs):
        if not request.user.is_staff:
            return Response(
                {'detail': 'Admin role required.'},
                status=status.HTTP_403_FORBIDDEN,
            )
        booking = self.get_object()
        serializer = self.get_serializer(instance=booking, data=request.data)
        serializer.is_valid(raise_exception=True)
        serializer.save()
        return Response(BookingSerializer(booking).data)
