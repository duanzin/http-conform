# HTTP Conformance Monitor

HTTP Conformance Monitor is an API monitoring application designed to help users register external HTTP endpoints, monitor their availability and behavior over time, and understand uptime, response latency, and service incidents.

The project is intentionally structured as a simple but production-like stack:
- Next.js frontend for the dashboard and user experience
- Spring Boot backend for API logic and persistence
- PostgreSQL for durable data storage
- Docker Compose for local development orchestration


## Project goals

The project emphasizes:

- maintainable architecture
- secure defaults
- testable code
- clean REST API design
- Docker-based local development
- production-like monitoring workflows
- incremental milestone delivery

## Product concept

An user creates an account and registers external APIs or endpoints to monitor. The system periodically calls each endpoint, records the result, and tracks metrics such as:

- HTTP status code
- success or failure outcome
- response time
- error messages
- uptime trends
- recent incidents

The dashboard is intended to provide:
- current monitor status
- uptime summaries
- response-time history
- recent check results
- incidents timeline
- manual trigger and scheduled execution

## Core user flow

1. Create an account or authenticate
2. Add a monitor with a name, URL, HTTP method, interval, timeout, and enabled flag
3. Trigger a manual check
4. Let the automated scheduler run periodic checks
5. Store each result in PostgreSQL
6. Calculate availability, latency, and incident state
7. Display results in the dashboard

## Repository structure

```text
http-conform/
├── backend/
│   ├── src/
│   │   ├── main/
│   │   │   ├── java/
│   │   │   │   └── com/httpconformance/
│   │   │   └── resources/
│   │   └── test/
│   ├── Dockerfile
│   ├── pom.xml
│   └── ...
├── frontend/
│   ├── app/
│   ├── Dockerfile
│   ├── package.json
│   └── ...
├── docker-compose.yml
├── README.md
├── .gitignore
└── ...
```

## Current implementation status

This repository currently contains the milestones completed through **Weekend 3**:

- **Weekend 1 — Foundation**:
  - Next.js + TypeScript frontend and Spring Boot (Java 17) backend scaffolds.
  - Docker Compose stack for PostgreSQL, backend, and frontend.
  - Public health endpoint at `GET /api/health`.
  - Flyway migrations initializing `users`, `monitors`, `check_results`, and `incidents`.
  - Global standard error responses (`VALIDATION_ERROR`, `NOT_FOUND`, etc.).

- **Weekend 2 — Monitor CRUD & Dashboard UI**:
  - Full domain model and persistence for monitors (`Monitor`, `MonitorRepository`, `MonitorService`, `MonitorController`).
  - Validation rules on monitor name, URL, method, interval (>= 10s), and timeout (>= 100ms).
  - Frontend dashboard at `/monitors` with responsive form controls, status messages, and live list/edit/delete actions.

- **Weekend 3 — Authentication & Ownership Isolation**:
  - OAuth2 Resource Server with JWT validation (`spring-boot-starter-oauth2-resource-server`).
  - User synchronization and JIT provisioning via `CurrentUserService` mapping JWT subject and claims into `users`.
  - Protected endpoints requiring valid Bearer tokens for all `/api/monitors/**` operations.
  - Multi-tenant data scoping preventing cross-user access (User B cannot view, edit, or delete User A's monitors).
  - Next.js API route proxy forwarding `Authorization` headers.
  - Comprehensive automated integration tests verifying security, CRUD lifecycle, and cross-tenant boundaries.

## Backend API status

### Public endpoints

- `GET /api/health` — Application and database liveness check
- `GET /actuator/health` — Spring Boot actuator health

### Authenticated endpoints (Requires `Authorization: Bearer <token>`)

- `GET /api/monitors` — List all monitors owned by the authenticated user
- `POST /api/monitors` — Create a new monitor associated with the authenticated user
- `GET /api/monitors/{id}` — Get monitor details (scoped to owner)
- `PUT /api/monitors/{id}` — Update monitor details (scoped to owner)
- `DELETE /api/monitors/{id}` — Delete monitor (scoped to owner)

### Monitor DTO contracts

- `CreateMonitorRequest`
- `UpdateMonitorRequest`
- `MonitorResponse`

### Standard API error format

```json
{
  "code": "VALIDATION_ERROR",
  "message": "Request validation failed",
  "details": ["field: message"],
  "path": "/api/...",
  "timestamp": "2026-01-01T00:00:00Z"
}
```

## Authentication approach

The application uses an **OAuth2 Resource Server (JWT)** strategy:
- Outbound requests pass an `Authorization: Bearer <JWT>` header.
- In production/staging, the backend verifies tokens against the identity provider (e.g. Clerk, Auth0, Supabase Auth) via `JWT_ISSUER_URI` or `JWT_JWK_SET_URI`.
- The user is automatically synced into the local PostgreSQL database and all monitor records are associated with the authenticated user's ID.
- In offline/development testing, a fallback decoder allows seamless headless development and mock MVC tests.

## Local development

### 1) Start the stack

```bash
docker compose up --build
```

### 2) Access the services

- Frontend: http://localhost:3000
- Monitor Dashboard: http://localhost:3000/monitors
- Backend API: http://localhost:8080
- Backend health: http://localhost:8080/api/health
- PostgreSQL: localhost:5432

## Environment requirements

### Required tools

- Docker Desktop or Docker Engine
- Docker Compose
- Node.js 22 LTS for the frontend
- Java 17 for the backend
- Maven for backend builds

### Java and Maven installation (Windows)

If you do not already have a Java environment configured, install Java 17 and Maven before running backend tasks.

#### Install Java 17

1. Download Temurin JDK 17 or Oracle JDK 17
2. Install it to a location such as `C:\Program Files\Eclipse Adoptium\jdk-17`
3. Add the JDK `bin` directory to your `PATH`
4. Verify with:

```powershell
java -version
javac -version
```

#### Install Maven

1. Download the Maven binary zip from the official Apache Maven website
2. Extract it to a folder such as `C:\Program Files\apache-maven-3.9.x`
3. Add `M2_HOME` and `%M2_HOME%\bin` to your environment variables
4. Verify with:

```powershell
mvn -version
```

## Backend build and verification

From the `backend` directory:

```bash
mvn clean test
```

If you want a packaged jar:

```bash
mvn clean package
```

## Frontend build and verification

From the `frontend` directory:

```bash
npm install
npm run build
```

## Docker notes

The project is intended to run locally with Docker Compose, which is the easiest way to bring up the database and service stack consistently.

The current Compose stack includes:
- PostgreSQL container
- backend service
- frontend service

## Roadmap

- [x] **Weekend 1**: Foundation & Scaffolding
- [x] **Weekend 2**: Monitor CRUD & Frontend Dashboard
- [x] **Weekend 3**: Authentication & Ownership Isolation
- [ ] **Weekend 4**: Manual Health Checks (`POST /api/monitors/{id}/check` & HTTP client)
- [ ] **Weekend 5**: Scheduled Monitoring & Background Execution
- [ ] **Weekend 6**: Dashboard & Analytics (Uptime & Latency Charts)
- [ ] **Weekend 7**: Incident Detection & Downtime State Machine
- [ ] **Weekend 8**: Security & Reliability Hardening (Rate Limiting, SSRF Protection)
- [ ] **Weekend 9**: Integration Testing & Testcontainers
- [ ] **Weekend 10**: CI/CD Pipeline
- [ ] **Weekend 11**: Deployment & Production Setup
- [ ] **Weekend 12**: Public Status Pages

## Quick start summary

```bash
docker compose up --build
```

Then open:
- http://localhost:3000
- http://localhost:3000/monitors
- http://localhost:8080/api/health

