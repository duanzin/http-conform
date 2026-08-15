# HTTP Conformance Monitor

API monitoring project.

## Current milestone status

This repository now includes the planned **Week 1 foundation + immediate design groundwork**:

- Next.js frontend scaffold (`/frontend`)
- Spring Boot backend scaffold (`/backend`)
- PostgreSQL development stack via Docker Compose (`/docker-compose.yml`)
- `GET /api/health` endpoint in backend
- Flyway `V1` migration with initial `users`, `monitors`, `check_results`, `incidents` schema
- Initial monitor API DTO contracts and global error response shape

## Backend API foundations

### Health
- `GET /api/health`

### Monitor DTO contracts (initial)
- `CreateMonitorRequest`
- `UpdateMonitorRequest`
- `MonitorResponse`

### Standard error response
```json
{
  "code": "VALIDATION_ERROR",
  "message": "Request validation failed",
  "details": ["field: message"],
  "path": "/api/...",
  "timestamp": "2026-01-01T00:00:00Z"
}
```

## Authentication strategy (initial)

For MVP speed, use an **external auth provider strategy** (for example, Clerk/Auth0/Supabase Auth) and keep backend authorization ownership checks in Spring Security and service layers.

This repo currently contains the backend security baseline:
- `/api/health` is public
- all other routes require authentication

## Local development

```bash
docker compose up --build
```

- Frontend: http://localhost:3000
- Backend health: http://localhost:8080/api/health
- PostgreSQL: localhost:5432
