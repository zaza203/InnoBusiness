# Django Booking Backend

This is a Django + Django REST Framework backend for a booking system with admin and user workflows.

## Quick start

```bash
python -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt
python manage.py migrate
python manage.py createsuperuser
python manage.py runserver
```

The API is available under `http://localhost:8000/api/`.

## Core endpoints

- `GET /api/resources/` list resources
- `POST /api/resources/` create resource (admin recommended)
- `GET /api/bookings/` list bookings
- `POST /api/bookings/` create booking
- `PATCH /api/bookings/{id}/status/` update status (admin only)
- `GET /api/users/` list users (admin only)
- `POST /api/users/` create user (admin only)
