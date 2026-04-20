# Store Project

A full-stack e-commerce platform with a NestJS authentication microservice and a React frontend.

---

## Architecture

```
store project/
├── backend/
│   └── auth-service/   # NestJS REST API — port 3001
└── frontend/           # React + Vite SPA — port 5173
```

---

## Tech Stack

| Layer      | Technology                                      |
|------------|-------------------------------------------------|
| Backend    | NestJS 11, TypeScript, TypeORM, PostgreSQL      |
| Auth       | Passport.js, JWT (access + refresh), bcryptjs  |
| Validation | class-validator, class-transformer              |
| API Docs   | Swagger / OpenAPI (`/api/docs`)                 |
| Frontend   | React 19, Vite, TypeScript                      |

---

## Prerequisites

- Node.js 18+
- PostgreSQL (running locally or remote)
- The `store` schema must exist in your database:
  ```sql
  CREATE SCHEMA IF NOT EXISTS store;
  ```

---

## Environment Setup

Create `backend/auth-service/.env` (never commit real secrets):

```env
DB_HOST=localhost
DB_PORT=5432
DB_USERNAME=postgres
DB_PASSWORD=yourpassword
DB_NAME=postgres

JWT_ACCESS_SECRET=change_me_in_prod
JWT_ACCESS_EXPIRES_IN=15m
JWT_REFRESH_SECRET=change_me_in_prod
JWT_REFRESH_EXPIRES_IN=7d

PORT=3001
NODE_ENV=development
```

---

## Getting Started

### Backend (Auth Service)

```bash
cd backend/auth-service
npm install
npm run start:dev
```

API available at `http://localhost:3001/api`  
Swagger docs at `http://localhost:3001/api/docs`

### Frontend

```bash
cd frontend
npm install
npm run dev
```

App available at `http://localhost:5173`

---

## API Endpoints

All routes are prefixed with `/api`.

| Method | Route              | Auth Required | Description                        |
|--------|--------------------|---------------|------------------------------------|
| POST   | `/auth/signup`     | No            | Register a new user                |
| POST   | `/auth/signin`     | No            | Login — returns access + refresh tokens |
| POST   | `/auth/signout`    | Yes           | Logout — invalidates refresh token |
| GET    | `/auth/profile`    | Yes           | Get current user profile           |

### Example: Sign Up

```http
POST /api/auth/signup
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "StrongPass123!",
  "name": "Alice"
}
```

---

## User Entity

| Field          | Type              | Notes                              |
|----------------|-------------------|------------------------------------|
| `id`           | UUID              | Auto-generated                     |
| `email`        | string (unique)   | Validated email                    |
| `password`     | string            | bcryptjs hashed, never returned    |
| `name`         | string            | Default: `'Anonymous'`             |
| `role`         | `admin` \| `user` | Default: `user`                    |
| `refreshToken` | string \| null    | Hashed; nullified on signout       |
| `createdAt`    | Date              | Auto-set                           |
| `updatedAt`    | Date              | Auto-updated                       |

---

## Security

- Passwords hashed with **bcryptjs** (10 salt rounds)
- **Dual JWT tokens**: short-lived access (15 min) + long-lived refresh (7 days)
- Refresh tokens are **hashed** before storage
- **Global JWT guard** — every route protected by default; use `@Public()` to opt out
- **Role-based access control** via `@Roles()` decorator
- Input validation rejects unknown fields
- Generic error messages prevent user enumeration
- CORS restricted to `localhost:3000` and `localhost:5173`

---

## Available Scripts

### Backend

| Script              | Description                    |
|---------------------|--------------------------------|
| `npm run start:dev` | Watch mode (development)       |
| `npm run build`     | Compile TypeScript             |
| `npm run start:prod`| Run compiled production build  |
| `npm run test`      | Unit tests                     |
| `npm run test:e2e`  | End-to-end tests               |
| `npm run lint`      | ESLint check + auto-fix        |
| `npm run format`    | Prettier format                |

### Frontend

| Script            | Description                    |
|-------------------|--------------------------------|
| `npm run dev`     | Vite dev server                |
| `npm run build`   | Production build               |
| `npm run preview` | Preview production build       |
| `npm run lint`    | ESLint check                   |

---

## Notes

- `synchronize: true` is enabled in development — TypeORM will auto-create/alter tables. Use migrations in production.
- No Docker setup yet; services are intended for local development.
- Frontend auth UI is not yet implemented (scaffold only).
