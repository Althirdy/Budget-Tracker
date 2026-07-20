# Windows Local Development Setup

This guide starts from a clean Windows desktop and ends with all four Tally services running. Complete each step in order.

All application runtimes execute inside Docker. Do not install PHP, Composer, Node.js, npm, MySQL, or Nginx on Windows.

## Step 1: Install the Required Tools

Install:

1. [Git for Windows](https://git-scm.com/download/win)
2. [Docker Desktop](https://www.docker.com/products/docker-desktop/)
3. Windows PowerShell 5.1 or newer

Start Docker Desktop. Wait until its engine is running and confirm it is using Linux containers.

Open PowerShell and verify the tools:

```powershell
git --version
docker version
docker compose version
```

If the final command is unavailable but `docker-compose version` works, replace `docker compose` with `docker-compose` in manual commands. The setup script detects either version automatically.

Do not continue until `docker version` shows both Client and Server information.

## Step 2: Check for an Older Local Installation

### Scenario A: Clean laptop

If this is the first time you have run Budget Tracker or Trio Expense, continue to Step 3.

### Scenario B: Old containers exist

List possible old containers:

```powershell
docker ps -a --filter "name=budget_tracker" --filter "name=trio_expense"
```

If the list contains old application containers, remove only those containers:

```powershell
docker rm -f budget_tracker_client budget_tracker_api budget_tracker_api_nginx budget_tracker_mysql
docker rm -f trio_expense_frontend
```

An error saying a named container does not exist is harmless. Container removal does not delete named volumes, so existing MySQL data remains available.

If another old container name appears in the filtered list, copy that exact name from the `NAMES` column and run:

```powershell
docker rm -f EXACT_CONTAINER_NAME
```

Do not use broad cleanup commands such as:

```text
docker system prune
docker container prune
docker volume prune
```

Those commands may affect unrelated projects.

### Scenario C: An existing Budget Tracker clone is running

From that existing repository folder, stop its Compose stack safely:

```powershell
docker compose down --remove-orphans
```

This preserves named volumes and database contents. Afterward, continue with the clone you intend to use.

## Step 3: Clone the Repository

Choose a workspace such as your Windows Desktop:

```powershell
Set-Location "$env:USERPROFILE\Desktop"
git clone https://github.com/Althirdy/Budget-Tracker.git
Set-Location Budget-Tracker
```

Confirm that you are in the correct folder:

```powershell
Get-Location
Get-ChildItem
```

The folder must contain `api`, `client`, `scripts`, and `docker-compose.yml`.

## Step 4: Run the One-Command Setup

Run:

```powershell
.\scripts\setup.ps1
```

The script performs these operations in order:

1. Verifies Docker Desktop and Compose.
2. Confirms ports `5173` and `8080` are available.
3. Creates `api/.env` and `client/.env` from committed examples when missing.
4. Builds the Laravel and React images.
5. Installs Composer packages and exact npm lockfile dependencies inside Docker.
6. Starts React, PHP-FPM, Nginx, and MySQL.
7. Generates Laravel's key only when the key is empty.
8. Runs database migrations and local development seeders.
9. Checks the client and API health endpoint.

The first run can take several minutes. Do not interrupt it while images or dependencies are being downloaded.

The setup is safely rerunnable. It preserves existing `.env` files, `APP_KEY`, dependency volumes, and MySQL data.

### If PowerShell blocks the script

Allow scripts for only the current PowerShell window:

```powershell
Set-ExecutionPolicy -Scope Process -ExecutionPolicy Bypass
.\scripts\setup.ps1
```

Closing the PowerShell window removes this temporary policy change.

## Step 5: Verify the Containers

Run:

```powershell
docker compose ps
```

Expected services:

| Service | Purpose | Expected state |
| --- | --- | --- |
| `client` | React/Vite | Running and healthy |
| `api` | Laravel PHP-FPM | Running and healthy |
| `api_nginx` | Laravel web server | Running and healthy |
| `mysql` | MySQL 8.4 | Running and healthy |

Container names are `budget_tracker_client`, `budget_tracker_api`, `budget_tracker_api_nginx`, and `budget_tracker_mysql`.

If a service is missing or unhealthy:

```powershell
docker compose ps -a
docker compose logs --tail=200 client api api_nginx mysql
```

## Step 6: Verify the Application

Open these addresses:

- Tally client: <http://localhost:5173>
- Laravel API health: <http://localhost:8080/api/v1/health>

The health endpoint should return JSON containing `"status": "ok"`.

Sign in:

```text
Email:    test@example.com
Password: password
```

The local seeder creates this account and sample income and expense categories.

## Step 7: Understand the Environment Files

No manual `.env` editing is required for normal onboarding.

Laravel Docker defaults:

```env
APP_URL=http://localhost:8080
FRONTEND_URL=http://localhost:5173
DB_CONNECTION=mysql
DB_HOST=mysql
DB_PORT=3306
DB_DATABASE=budget_tracker
DB_USERNAME=budget_user
DB_PASSWORD=budget_password
```

React uses:

```env
VITE_API_BASE_URL=http://localhost:8080/api/v1
```

`DB_HOST=mysql` is required because Laravel connects to the Compose service. Inside the API container, `localhost` would mean the API container itself.

Real `.env` files are local-only and ignored by Git. Never commit them. Team-wide default changes belong in `.env.example`.

## Step 8: Daily Development

Always run commands from the repository root.

Start the stack:

```powershell
docker compose up -d
```

Check status:

```powershell
docker compose ps
```

Follow logs:

```powershell
docker compose logs -f
```

Stop the stack while preserving data:

```powershell
docker compose down
```

Rebuild after a Dockerfile change:

```powershell
docker compose up -d --build
```

Service-specific logs:

```powershell
docker compose logs -f client
docker compose logs -f api
docker compose logs -f api_nginx
docker compose logs -f mysql
```

## Step 9: Laravel and React Commands

Laravel:

```powershell
docker compose exec api php artisan migrate
docker compose exec api php artisan db:seed
docker compose exec api php artisan test
docker compose exec api php artisan tinker
```

Composer dependency changes:

```powershell
docker compose exec api composer require vendor/package
```

React checks:

```powershell
docker compose exec client npm run typecheck
docker compose exec client npm run lint
docker compose exec client npm run test
docker compose exec client npm run build
```

Add or update a client dependency:

```powershell
docker compose exec client npm install package-name
```

Maintainers use `npm install` only when intentionally changing dependencies and commit both `client/package.json` and `client/package-lock.json`. Setup and fresh clones use `npm ci`, which installs the exact committed lockfile without rewriting it.

## Step 10: Manual Setup Fallback

Use this only when `scripts/setup.ps1` cannot run. Do not overwrite an existing `.env` or regenerate an established `APP_KEY`.

For a fresh clone with no `.env` files:

```powershell
Copy-Item api/.env.example api/.env
Copy-Item client/.env.example client/.env
docker compose build
docker compose run --rm api composer install --no-interaction --prefer-dist
docker compose run --rm client npm ci
docker compose up -d --remove-orphans
docker compose exec api php artisan key:generate
docker compose exec api php artisan migrate --seed
docker compose ps
```

## Safe Cleanup Versus Database Reset

### Remove and recreate containers while keeping data

Use this for stale containers, changed Compose configuration, or ordinary troubleshooting:

```powershell
docker compose down --remove-orphans
docker compose up -d --build
```

Named volumes remain intact.

### Permanently reset the local database

Only use this when local data can be discarded. The command below permanently deletes this project's MySQL volume:

```powershell
docker compose down
docker volume ls --filter "name=budget-tracker_mysql_data"
docker volume rm budget-tracker_mysql_data
docker compose up -d
docker compose exec api php artisan migrate --seed
```

Verify that the listed volume name is exactly `budget-tracker_mysql_data` before removing it. Never use `docker volume prune` for this task.

## Troubleshooting

### Docker engine or named-pipe error

Start Docker Desktop and wait for the engine. Reopen PowerShell if Docker still cannot connect.

### Container name already in use

Follow Step 2. List matching containers, remove the exact stale container names, and rerun setup.

### Port 5173 or 8080 is already in use

```powershell
Get-NetTCPConnection -State Listen -LocalPort 5173,8080
docker ps --format "table {{.Names}}\t{{.Ports}}"
```

Stop only the application or container using the required port.

### Client container exits

The npm dependency volume may be empty or stale:

```powershell
docker compose run --rm client npm ci
docker compose up -d client
docker compose logs --tail=200 client
```

### Composer extraction timeout

```powershell
docker compose run --rm -e COMPOSER_PROCESS_TIMEOUT=1200 api composer install --prefer-dist
```

### MySQL says `Access denied`

MySQL applies `MYSQL_*` values only when creating a new database volume. Preserve the volume if its data matters. If it contains disposable development data, use the explicit database-reset procedure above.

### Laravel reports `tempnam()` or cannot compile views

```powershell
docker compose up -d --build api api_nginx
docker compose exec api php artisan optimize:clear
```

### Orphan warning mentions `trio_expense_frontend`

Remove that exact old container:

```powershell
docker rm -f trio_expense_frontend
docker compose up -d --remove-orphans
```

### Collect diagnostics for the team

```powershell
docker compose ps -a
docker compose logs --tail=200 client api api_nginx mysql
docker ps -a --filter "name=budget_tracker" --filter "name=trio_expense"
```

Send the full output with a screenshot of the first error.
