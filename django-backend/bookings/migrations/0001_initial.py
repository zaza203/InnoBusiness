from django.conf import settings
from django.db import migrations, models
import django.db.models.deletion


class Migration(migrations.Migration):
    initial = True

    dependencies = [
        migrations.swappable_dependency(settings.AUTH_USER_MODEL),
    ]

    operations = [
        migrations.CreateModel(
            name='Resource',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('name', models.CharField(max_length=255)),
                ('resource_type', models.CharField(max_length=100)),
                ('location', models.CharField(blank=True, max_length=255)),
                ('capacity', models.PositiveIntegerField(blank=True, null=True)),
                ('status', models.CharField(default='active', max_length=50)),
                ('created_at', models.DateTimeField(auto_now_add=True)),
            ],
        ),
        migrations.CreateModel(
            name='Booking',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('title', models.CharField(max_length=255)),
                ('start_at', models.DateTimeField()),
                ('end_at', models.DateTimeField()),
                ('requester_name', models.CharField(blank=True, max_length=255)),
                ('requester_email', models.EmailField(blank=True, max_length=254)),
                (
                    'status',
                    models.CharField(
                        choices=[('pending', 'Pending'), ('approved', 'Approved'), ('rejected', 'Rejected')],
                        default='pending',
                        max_length=20,
                    ),
                ),
                ('created_at', models.DateTimeField(auto_now_add=True)),
                (
                    'requested_by',
                    models.ForeignKey(
                        blank=True,
                        null=True,
                        on_delete=django.db.models.deletion.SET_NULL,
                        related_name='bookings',
                        to=settings.AUTH_USER_MODEL,
                    ),
                ),
                (
                    'resource',
                    models.ForeignKey(
                        on_delete=django.db.models.deletion.CASCADE,
                        related_name='bookings',
                        to='bookings.resource',
                    ),
                ),
            ],
        ),
    ]
