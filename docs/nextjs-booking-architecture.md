# ReserveHub Architecture (Next.js Fullstack)

## High-level structure
Single Next.js app with:
- Frontend pages/components (`app/`, `components/`)
- Backend route handlers (`app/api/**`)
- Persistence (`prisma/schema.prisma`)
- Shared domain logic (`lib/*`)

## Domain entities
- User, Session
- Resource, ResourceImage
- Booking, WaitingList
- Payment
- Review
- Notification
- ActivityLog

## Role capabilities
### Customer
- Register/login
- Browse/filter resources + details
- Create bookings
- Recurring bookings
- Cancel own bookings
- View upcoming/past bookings
- Pay for booking (simulated)
- Leave reviews

### Admin
- All customer rights
- Full resource CRUD
- Approve/reject bookings
- View all bookings
- Access analytics dashboard
- Trigger reminders job

## Key rule engine
Implemented in `lib/booking-rules.ts`:
- 30-minute slot increment enforcement
- Max duration (8h)
- Overlap prevention
- Time validity checks

## Notification flow
API-level notification queue in `Notification` table:
- Confirmation on booking create/status update
- Cancellation email
- Reminder email via `/api/reminders/run`

## Calendar model
`/api/calendar/availability` returns booked blocks for a resource in a date range.
Frontend renders week/month availability grid.

## Swagger
- JSON: `/api/docs`
- UI: `/api-docs`

## Notes
- Payment integration is a simulated gateway in `/api/payments/checkout` with provider ref.
- Image upload is URL-based (suitable for integrating with S3/Cloudinary later).
- `gaigroup.net` palette scraping was blocked (HTTP 403), so placeholder enterprise tokens are used.
