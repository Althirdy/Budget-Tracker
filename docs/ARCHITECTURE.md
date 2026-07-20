# Application Architecture

Budget Tracker is a feature-first modular monolith. New code is grouped by business capability first and layered only where the capability needs separation.

## Laravel

```text
HTTP -> Application -> Domain
           |
           v
      Infrastructure
```

- **HTTP** owns controllers, form requests, resources, status codes, cookies, and sessions.
- **Application** owns use-case orchestration through small action classes.
- **Domain** owns framework-independent rules, value objects, and invariants when a feature develops real business complexity.
- **Infrastructure** owns non-trivial persistence and external integrations.

Do not create empty layers, repository wrappers around basic Eloquent calls, or interfaces with only one trivial implementation. The authentication feature intentionally has HTTP and Application layers while continuing to use the shared `App\Models\User` model and Laravel's session guard.

Feature example:

```text
app/Features/Auth/
├── Application/Actions/
└── Http/
    ├── Controllers/
    ├── Requests/
    └── Resources/
```

Controllers validate transport concerns and delegate workflows. Application actions must not return HTTP responses. Resources define stable public JSON shapes.

## React

```text
app -> features -> shared UI and infrastructure
```

- `app` composes providers and routes.
- `features/<name>` owns its API functions, types, schemas, state, components, pages, and route guards.
- `components/ui` contains shadcn primitives with no feature knowledge.
- `lib` contains shared technical infrastructure such as the Axios client.

Shared code must not import from a feature. Avoid generic `services`, `helpers`, and `types` folders. Keep tests beside the feature behavior they verify.

Authentication uses React Context because it is small session-wide client state. Add TanStack Query when accounts, budgets, and transactions introduce cacheable server state; do not place financial server data in Auth Context.

## Authentication Flow

```text
React -> GET /sanctum/csrf-cookie
React -> POST /api/v1/auth/login
Browser <- HttpOnly Laravel session cookie
React -> GET /api/v1/auth/me
React -> POST /api/v1/auth/logout
```

The browser session uses Laravel Sanctum cookies. React never stores JWTs, access tokens, passwords, or the authenticated user in localStorage.
