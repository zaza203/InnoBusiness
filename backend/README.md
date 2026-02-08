# InnoBusiness Backend (MVP)

This is a NestJS + Prisma backend implementing the core ERP MVP endpoints with tenant isolation.

## Quick start

```bash
cd backend
cp .env.example .env
npm install
npm run prisma:generate
npm run prisma:migrate
npm run start:dev
```

## Tenant header

All requests require `x-tenant-id`.

## Endpoints

- `GET /customers`
- `POST /customers`
- `GET /products`
- `POST /products`
- `GET /invoices`
- `GET /invoices/:id`
- `POST /invoices`
- `GET /payments`
- `POST /payments`
- `GET /expenses`
- `POST /expenses`

## Swagger

Once the server is running, open:

- `http://localhost:3000/docs`
