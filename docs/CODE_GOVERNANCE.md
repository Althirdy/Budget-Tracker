# Code Governance

This document defines how we add backend APIs, database migrations, and frontend features as the project grows.

## API Conventions

All backend API routes use this shape:

```text
/api/v1/<resource>
```

Examples:

```text
GET /api/v1/health
GET /api/v1/transactions
POST /api/v1/transactions
GET /api/v1/categories
```

API responses must be JSON only. Controllers should explicitly use Yii2 JSON responses for API actions.

The current reference endpoint is:

```text
GET /api/v1/health
```

Authenticated endpoints use JWT Bearer tokens:

```text
Authorization: Bearer <accessToken>
```

Current auth endpoints:

```text
POST /api/v1/auth/login
POST /api/v1/auth/refresh
POST /api/v1/auth/logout
GET /api/v1/auth/me
```

Roles use integer values:

```text
1 = admin
2 = user
```

Access tokens last 15 minutes. Refresh tokens last 2 hours and are stored in the database as hashes only.

## Backend Structure

New backend features should use feature modules with strict internal layers:

```text
api/modules/<feature>/controllers
api/modules/<feature>/models
api/modules/<feature>/services
api/modules/<feature>/repositories
api/modules/<feature>/requests
api/modules/<feature>/resources
```

Example:

```text
api/modules/transactions/controllers
api/modules/transactions/models
api/modules/transactions/services
api/modules/transactions/repositories
api/modules/transactions/requests
api/modules/transactions/resources
```

Shared Yii2 application config stays in `api/config`.

Database migrations stay in Yii2's conventional `api/migrations` folder.

## Backend Layer Rules

Controllers handle HTTP concerns:

- route actions
- request parsing
- response formatting
- status codes
- calling services

Services handle business logic:

- validation flow that is not tied only to one model
- orchestration across models or repositories
- transaction boundaries when a use case changes multiple records

Repositories handle persistence when queries grow beyond simple ActiveRecord usage:

- reusable query methods
- filtered lists
- joins
- persistence helpers

Models represent database-backed domain data or Yii2 form/request models.

Requests handle input validation when an endpoint needs dedicated request validation.

Resources shape outbound JSON when an endpoint should not expose raw model attributes.

## Adding a Backend API

Use this workflow for new backend endpoints:

1. Create a migration first when the schema changes.
2. Create or update the model.
3. Add service logic for the use case.
4. Add repository logic if persistence is more than simple ActiveRecord.
5. Add a controller action that returns JSON.
6. Register the route under `/api/v1`.
7. Update `api/docs/openapi.yaml`.
8. Test the endpoint through `http://localhost:8080/api/v1/...`.

Run backend unit tests when API behavior changes:

```powershell
docker-compose exec api vendor/bin/codecept build
docker-compose exec api vendor/bin/codecept run Unit
```

Migration commands:

```powershell
docker-compose exec api php yii migrate/create create_example_table
docker-compose exec api php yii migrate
```

Yii2 console check:

```powershell
docker-compose exec api php yii
```

## Frontend Structure

Frontend features live under:

```text
frontend/src/lib/features/<feature>
```

Each feature can contain:

```text
api.ts
types.ts
stores.ts
components/
utils.ts
```

Use `api.ts` for backend calls and keep API URLs centralized around the backend base URL.

Use `types.ts` for TypeScript contracts that match backend JSON responses.

Use `stores.ts` only when feature state must be shared across components or routes.

Use `components/` for UI that belongs only to that feature.

Use `utils.ts` only for helper logic local to the feature.

## Shared Frontend Code

Shared reusable UI belongs in:

```text
frontend/src/lib/components
```

Shared API/client utilities belong in:

```text
frontend/src/lib/api
```

Route files in `frontend/src/routes` should compose screens and delegate reusable logic to `src/lib`.

## Frontend Feature Workflow

Use this workflow when adding a frontend feature:

1. Create `frontend/src/lib/features/<feature>`.
2. Add `types.ts` for API contracts.
3. Add `api.ts` for backend requests.
4. Add feature components under `components/`.
5. Add shared state in `stores.ts` only when needed.
6. Compose the page in `frontend/src/routes`.

## Review Checklist

Before finishing an API or frontend feature, confirm:

- API routes are under `/api/v1`.
- API responses are JSON.
- API documentation is updated in `api/docs/openapi.yaml`.
- Migrations are committed when schema changes.
- Business logic is not buried in controllers.
- Frontend API calls are not scattered through route files.
- Shared frontend code is placed in `src/lib`, not duplicated per route.
