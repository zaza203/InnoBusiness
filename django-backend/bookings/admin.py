from django.contrib import admin

from .models import Booking, Resource


@admin.register(Resource)
class ResourceAdmin(admin.ModelAdmin):
    list_display = ('name', 'resource_type', 'status', 'location', 'capacity')
    search_fields = ('name', 'resource_type')


@admin.register(Booking)
class BookingAdmin(admin.ModelAdmin):
    list_display = ('title', 'resource', 'start_at', 'end_at', 'status')
    list_filter = ('status', 'resource')
    search_fields = ('title', 'requester_name', 'requester_email')
