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

This repository currently contains the foundation work for the project, including:

- frontend scaffold with Next.js and TypeScript
- backend scaffold with Spring Boot and Java 17
- Docker Compose stack for PostgreSQL, backend, and frontend
- health endpoint at `/api/health`
- initial Flyway migration with `users`, `monitors`, `check_results`, and `incidents`
- initial monitor request/response DTOs
- global API error handling contract
- basic security configuration with health routes public and all other routes authenticated by default

## Backend API status

### Health endpoint

- `GET /api/health`

### Initial monitor DTO contracts

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

For the MVP and early milestones, the project is designed to use an external auth provider strategy (for example Clerk, Auth0, Supabase Auth, or another hosted identity provider). The backend should keep ownership verification and authorization checks in Spring Security and service logic.

The current backend baseline enforces:
- `/api/health` is public
- all other API routes are authenticated by default

## Local development

### 1) Start the stack

```bash
docker compose up --build
```

### 2) Access the services

- Frontend: http://localhost:3000
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

## Future roadmap

Planned milestones for the project include:

- user authentication and secure session handling
- monitor creation, update, and deletion
- periodic scheduled checks with background jobs
- check result persistence and aggregation
- uptime and latency calculation
- incident detection and resolution flow
- frontend dashboard pages and charts
- deployment and CI/CD automation
- security hardening and polish

## Notes for contributors

- Keep the architecture intentionally simple: one frontend, one backend, one database
- Favor production quality over broad but shallow feature scope
- Keep each weekend milestone independently runnable
- Ensure every change leaves the repository in a working state
- Prefer secure, testable patterns over shortcuts

## Quick start summary

```bash
docker compose up --build
```

Then open:
- http://localhost:3000
- http://localhost:8080/api/health

This project is currently in its foundational stage, but the repository is set up to support incremental growth toward a complete API monitoring platform.
