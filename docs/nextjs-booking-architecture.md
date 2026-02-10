# Next.js Booking System Architecture

## Context
Single Next.js application serving:
1. Frontend web UI for admins and customers.
2. Backend REST API via route handlers.
3. OpenAPI + Swagger UI docs.

## Domain model
- User(role=ADMIN|CUSTOMER)
- Resource(owner=ADMIN)
- Booking(resource + customer + status)

## Core validations
- Booking start must be before end.
- Booking start must be in the future.
- Overlap prevention for same resource with PENDING/APPROVED bookings.

## Authorization strategy
`x-user-id` header is used for demo authorization. In production, replace with JWT/session auth.

## Operations matrix
| Operation | Customer | Admin |
| --- | --- | --- |
| List resources | ✅ | ✅ |
| Create/update/delete resources | ❌ | ✅ |
| Create booking | ✅ | ✅ |
| View own bookings | ✅ | ✅ (all) |
| Approve/reject booking | ❌ | ✅ |
| Cancel own booking | ✅ | ✅ (any) |

## API docs
- OpenAPI JSON: `/api/docs`
- Swagger UI: `/api-docs`
