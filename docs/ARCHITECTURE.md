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

Authentication uses React Context because it is small session-wide client state. Categories and Budgets currently keep isolated server state in feature hooks. Introduce TanStack Query when multiple financial features need shared caching and cross-feature invalidation; do not place financial server data in Auth Context.

## Authentication Flow

```text
React -> GET /sanctum/csrf-cookie
React -> POST /api/v1/auth/login
Browser <- HttpOnly Laravel session cookie
React -> GET /api/v1/auth/me
React -> POST /api/v1/auth/logout
```

The browser session uses Laravel Sanctum cookies. React never stores JWTs, access tokens, passwords, or the authenticated user in localStorage.

## Reference CRUD Slice: Categories

Categories are the reference implementation for authenticated CRUD features.

```text
Request
  -> Form Request validation
  -> Category Controller
  -> Application Action
  -> User-scoped Eloquent relationship
  -> Category Resource
  -> typed React API
  -> feature state hook
  -> Category page and dialogs
```

Laravel keeps category transport code under `Features/Categories/Http`, workflows under `Application/Actions`, and closed business values under `Domain`. Basic Eloquent persistence remains on the shared `Category` model; add an Infrastructure repository only when persistence becomes genuinely complex.

React keeps category API calls, contracts, schemas, state, components, and pages under `features/categories`. Reusable Dialog, Select, Table, and Badge primitives remain under `components/ui` and must not import Category code.

Every category query begins from `User::categories()`. Controllers never accept `user_id`, and cross-user identifiers return 404. Deletion uses Laravel soft deletes so future transactions can retain historical category references.

## Monthly Budget Ownership

Budgets demonstrate a child aggregate owned by both a user and a category:

```text
User 1 -> many Budgets
Category 1 -> many Budgets across calendar months
Budget -> one User and one expense Category
```

The database and application layer enforce one budget per user, category, and month. The client never submits `user_id`; all operations begin from `User::budgets()`. Budget deletion is permanent because transactions do not reference budget IDs. Archived categories remain available when loading historical budgets.

Version one stores PHP planned amounts only. Spent, remaining, progress, and rollover calculations belong to the Transactions integration and must not be approximated in the Budget feature.

## Financial Accounts

Accounts follow the same authenticated vertical-slice flow as Categories. Every operation begins from `User::accounts()`, currency is fixed to PHP by the server, and deletion archives the record so future transaction history remains valid.

Closed backend values such as account type and icon are PHP backed enums and are validated with `Rule::enum`. React mirrors these public API values with readonly constant arrays and derived TypeScript unions. The backend remains the source of truth; client constants provide compile-time safety and must be updated whenever the public enum contract changes.

Accounts store an opening balance only. Credit-card opening balances are positive amounts owed. Current balances, transfers, adjustments, and reconciliation must be derived from the future Transactions feature rather than written directly to accounts.

## User Feedback and API Errors

CRUD API clients throw the shared `ApiError` contract with a user-facing message and Laravel field errors. A form maps recognized field errors to React Hook Form so messages appear beside the relevant input. Errors without a visible matching field, including restore and archive failures, use the global Sonner toast. Successful mutations also use concise toasts.

Hooks remain notification-free: they return data or throw errors, while the component that owns the user action owns its notification. Blocking list-load failures remain inline with a retry action because they represent page state rather than transient feedback.
