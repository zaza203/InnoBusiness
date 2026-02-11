from django.utils import timezone
from rest_framework import serializers

from .models import Booking, Resource


class ResourceSerializer(serializers.ModelSerializer):
    class Meta:
        model = Resource
        fields = [
            'id',
            'name',
            'resource_type',
            'location',
            'capacity',
            'status',
            'created_at',
        ]
        read_only_fields = ['id', 'created_at']


class BookingSerializer(serializers.ModelSerializer):
    resource_detail = ResourceSerializer(source='resource', read_only=True)

    class Meta:
        model = Booking
        fields = [
            'id',
            'resource',
            'resource_detail',
            'title',
            'start_at',
            'end_at',
            'requester_name',
            'requester_email',
            'status',
            'requested_by',
            'created_at',
        ]
        read_only_fields = ['id', 'status', 'requested_by', 'created_at']


class BookingCreateSerializer(serializers.ModelSerializer):
    class Meta:
        model = Booking
        fields = [
            'id',
            'resource',
            'title',
            'start_at',
            'end_at',
            'requester_name',
            'requester_email',
        ]
        read_only_fields = ['id']

    def validate(self, attrs):
        start_at = attrs['start_at']
        end_at = attrs['end_at']
        if start_at >= end_at:
            raise serializers.ValidationError('End time must be after start time.')
        if start_at < timezone.now():
            raise serializers.ValidationError('Start time must be in the future.')

        resource = attrs['resource']
        overlapping = Booking.objects.filter(
            resource=resource,
            status__in=[Booking.STATUS_PENDING, Booking.STATUS_APPROVED],
            start_at__lt=end_at,
            end_at__gt=start_at,
        ).exists()

        if overlapping:
            raise serializers.ValidationError('Resource is already booked for that time range.')
        return attrs


class BookingStatusSerializer(serializers.ModelSerializer):
    class Meta:
        model = Booking
        fields = ['status']

    def validate_status(self, value: str) -> str:
        valid_statuses = {choice[0] for choice in Booking.STATUS_CHOICES}
        if value not in valid_statuses:
            raise serializers.ValidationError('Invalid booking status.')
        return value
