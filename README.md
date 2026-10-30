# TaskFlow

TaskFlow is a collaborative project and task management system built with Node.js, Express, MongoDB, and React (Vite).

## Features

- **Project & Task Management**: Workspaces, project member roles, tasks, and subtasks.
- **Notes & Collaboration**: Interactive project notes and activity timeline.
- **Authentication**: JWT-based authentication with secure cookies and bearer token authorization.
- **Interactive Documentation**: OpenAPI/Swagger documentation available at `/api-docs`.
- **Dockerized Deployment**: Production-ready multi-stage Docker builds and Docker Compose orchestration.
- **Automated API Testing**: Fast, comprehensive test suites covering routes, auth guards, and validation using Vitest and Supertest.
- **Continuous Integration**: GitHub Actions CI workflow validating backend tests, frontend builds, and Docker containerization.

---

## Getting Started with Docker

You can run the full TaskFlow application (MongoDB + Backend + Frontend) using Docker Compose:

```bash
# 1. Copy sample environment file (optional, defaults are pre-configured)
cp .env.docker.example .env

# 2. Build and start all services
docker compose up --build

# 3. Access the applications
# Frontend: http://localhost:3000
# Backend API: http://localhost:8000
# API Docs: http://localhost:8000/api-docs
```

To stop all services:
```bash
docker compose down
```

---

## Running Locally

### Backend

```bash
cd backend
cp .env.example .env
npm install
npm run dev
```

### Frontend

```bash
cd frontend
cp .env.example .env.local
npm install
npm run dev
```

---

## Automated API Testing

The backend includes automated integration tests using Vitest and Supertest:

```bash
cd backend
npm test
```

Test coverage includes:
- Root & health check endpoints (`/`, `/api/v1/healthcheck`, `/api-docs`)
- Auth validation rules (required fields, email format, minimum length)
- JWT route guards for protected resources (Projects, Tasks, Notes, Current User, Logout)

---

## GitHub Actions CI Pipeline

The CI workflow is configured in `.github/workflows/ci.yml` and triggers on every push and pull request to `main`:

1. **Backend CI**: Runs MongoDB service container, installs dependencies, and executes the automated API test suite.
2. **Frontend CI**: Installs frontend dependencies and verifies the Vite production build.
3. **Docker CI**: Validates Docker Compose configuration, builds container images, and confirms live service health checks.

