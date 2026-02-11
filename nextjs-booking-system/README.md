# ReserveHub – Complete Booking System (Next.js Fullstack)

A complete booking platform for **customers** and **admins** in a single Next.js codebase (frontend + backend APIs + Swagger).

## Delivered functionality

### 1) User authentication
- Register
- Login
- Session token management (`x-session-token`)
- Role model: `CUSTOMER` and `ADMIN`

### 2) Resource management (Admin)
- Add / edit / delete resource
- Resource properties: type, capacity, location, description, status
- Resource image upload (image URL)

### 3) Browse resources
- List all resources
- Filter by type, capacity, location
- View details + images + ratings

### 4) Booking flow
- Select resource
- Choose date/time slot
- Availability check via calendar API
- Confirm booking
- Booking response includes confirmation details

### 5) Business rules
- No double booking on overlapping intervals
- Cannot book in the past
- Enforced 30-minute slot increments
- Max booking duration limit (8 hours)

### 6) My bookings
- Upcoming bookings
- Past bookings
- Cancel booking (ownership + role checks)

### 7) Dashboard
- Resource overview
- Upcoming/past booking counters
- Recent activity for admins

### 8) Email notifications (simulated queue)
- Booking confirmation
- Booking cancellation
- Reminder before booking time

### 9) Admin panel
- View all bookings
- Approve/reject workflow
- Analytics: totals, pending, waiting list, average rating

### 10) Calendar view
- Week/Month views
- Visual availability grid
- Booking-ready integration with booking form

### 11) Extended features delivered
- Recurring bookings
- Waiting list when slot conflict occurs
- Payment integration (simulated checkout)
- User reviews/ratings

### 12) Mobile experience
- Responsive modern UI (optimized for desktop + mobile browsers)

## Branding / Color system
I attempted to fetch colors from `gaigroup.net`, but this environment receives `HTTP 403` from that domain. Current palette is a GIA-inspired placeholder in:
- `app/globals.css`
- `lib/brand.ts`

Replace these with official brand tokens once provided.

## Stack
- Next.js 14 (App Router)
- Prisma ORM + SQLite
- Zod
- Swagger/OpenAPI (`next-swagger-doc` + `swagger-ui-react`)

## API documentation
- OpenAPI JSON: `/api/docs`
- Swagger UI: `/api-docs`

## Local setup
```bash
cd nextjs-booking-system
cp .env.example .env
npm install
npx prisma migrate dev --name init
npm run db:seed
npm run dev
```

## Demo credentials
- Admin: `admin@gia.local` / `Password123!`
- Customer: `customer@gia.local` / `Password123!`
