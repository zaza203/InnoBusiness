# GIA Booking Platform (Next.js Fullstack)

A fullstack booking system built in **Next.js** (frontend + backend/API) with role rules for:
- **Customer**: books resources, sees own bookings, can cancel own bookings.
- **Admin**: owns/manages resources, sees all bookings, approves/rejects bookings, manages resource lifecycle.

## Stack
- Next.js 14 (App Router)
- Prisma ORM + SQLite
- Zod validation
- Swagger/OpenAPI (`next-swagger-doc` + Swagger UI)

## Role rules
### Customer
- Can list resources.
- Can create bookings.
- Can view only own bookings.
- Can cancel only own bookings.
- Cannot manage resource definitions.
- Cannot approve/reject booking statuses.

### Admin
- Can list, create, update, delete resources.
- Can view all bookings.
- Can approve/reject/cancel any booking.

## API surface
- `POST /api/auth/login` (email-based demo login)
- `GET|POST /api/resources`
- `PATCH|DELETE /api/resources/:id`
- `GET|POST /api/bookings`
- `PATCH /api/bookings/:id/status`
- `DELETE /api/bookings/:id`
- `GET /api/docs` (OpenAPI JSON)
- Swagger UI: `/api-docs`

## Setup
```bash
cd nextjs-booking-system
cp .env.example .env
npm install
npx prisma migrate dev --name init
npm run db:seed
npm run dev
```

## Demo users (seed)
- `admin@gia.local` (ADMIN)
- `customer@gia.local` (CUSTOMER)

## Branding
The UI uses a GIA-inspired palette in `app/globals.css` and `lib/brand.ts`:
- Primary `#003B5C`
- Secondary `#00A3AD`
- Accent `#FFB81C`

These colors can be replaced with exact brand tokens if your design team provides official values.

## Project structure
```
nextjs-booking-system/
  app/
    api/...               # Backend route handlers
    dashboard/            # Main app screen
    api-docs/             # Swagger UI page
  components/             # Frontend components
  lib/                    # Auth, prisma, swagger, brand
  prisma/                 # Schema + seed
```
