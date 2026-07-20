# Windows Development Setup

This guide takes a new developer from a clean Windows laptop to a running Budget Tracker stack. All project runtimes and services execute inside Docker.

## 1. Install Prerequisites

Install [Git for Windows](https://git-scm.com/download/win) and [Docker Desktop](https://www.docker.com/products/docker-desktop/). Start Docker Desktop and wait until its engine is running. Docker Desktop must use Linux containers.

Open PowerShell and verify:

```powershell
git --version
docker version
docker-compose version
```

If your installation uses Compose v2, `docker compose version` replaces the final command. The setup script detects either form automatically.

Ports `5173` and `8080` must be available.

## 2. Clone and Run

Use the public HTTPS remote; the maintainer's `github-side` SSH hostname is machine-specific.

```powershell
git clone https://github.com/Althirdy/Budget-Tracker.git
Set-Location Budget-Tracker
.\scripts\setup.ps1
```

The script:

1. Checks Docker and required ports.
2. Copies `api/.env.example` to `api/.env` and `client/.env.example` to `client/.env` only when missing.
3. Builds the PHP and Node images.
4. Runs Composer and `npm ci` inside Docker.
5. Starts React, PHP-FPM, Nginx, and MySQL.
6. Generates `APP_KEY` only when it is empty.
7. Runs migrations and the repeatable development seeder.
8. Verifies the client and API.

It is safe to rerun. It does not overwrite environment files, regenerate an existing key, delete volumes, or reset the database.

### PowerShell execution policy

If Windows blocks the script, allow it for only the current PowerShell process:

```powershell
Set-ExecutionPolicy -Scope Process -ExecutionPolicy Bypass
.\scripts\setup.ps1
```

This does not permanently change the machine policy.

## 3. Environment Configuration

Local Docker defaults are already committed in the example files, so a new hire does not need to edit them.

Laravel uses:

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

`DB_HOST` must be `mysql`, the Compose service name. `localhost` from inside the API container would refer to that API container, not the database.

The client uses:

```env
VITE_API_BASE_URL=http://localhost:8080/api/v1
```

Real `.env` files are ignored by Git. Commit changes to `.env.example` when the whole team needs a new variable, but never commit real secrets. Restart affected containers after changing environment values:

```powershell
docker-compose up -d --force-recreate api client
```

## 4. Services and URLs

| Service | Purpose | Local address |
| --- | --- | --- |
| `client` | React/Vite development server | <http://localhost:5173> |
| `api_nginx` | Public web server for Laravel | <http://localhost:8080> |
| `api` | PHP-FPM Laravel runtime | Internal port `9000` |
| `mysql` | MySQL 8.4 database | Internal port `3306` |

Request flow:

```text
Browser -> React/Vite
Browser -> Nginx -> Laravel PHP-FPM -> MySQL
```

Health endpoint:

```powershell
Invoke-RestMethod http://localhost:8080/api/v1/health
```

## 5. Daily Workflow

Start, inspect, and stop:

```powershell
docker-compose up -d
docker-compose ps
docker-compose logs -f
docker-compose down
```

Service-specific logs:

```powershell
docker-compose logs -f client
docker-compose logs -f api
docker-compose logs -f api_nginx
docker-compose logs -f mysql
```

Laravel commands:

```powershell
docker-compose exec api php artisan
docker-compose exec api php artisan migrate
docker-compose exec api php artisan db:seed
docker-compose exec api php artisan test
docker-compose exec api php artisan tinker
```

Create a migration:

```powershell
docker-compose exec api php artisan make:migration create_example_table
```

Add or update a PHP dependency:

```powershell
docker-compose exec api composer require vendor/package
```

Client checks:

```powershell
docker-compose exec client npm run typecheck
docker-compose exec client npm run lint
docker-compose exec client npm run build
```

Add a JavaScript dependency during development:

```powershell
docker-compose exec client npm install package-name
```

Maintainers use `npm install` when intentionally changing dependencies and commit both `client/package.json` and `client/package-lock.json`. Fresh clones and automated setup use `npm ci` to install the exact committed lockfile without changing it.

## 6. Manual Setup Fallback

Use this only if the setup script cannot run:

```powershell
Copy-Item api/.env.example api/.env
Copy-Item client/.env.example client/.env
docker-compose build
docker-compose run --rm api composer install --no-interaction --prefer-dist
docker-compose run --rm client npm ci
docker-compose up -d --remove-orphans
docker-compose exec api php artisan key:generate
docker-compose exec api php artisan migrate --seed
docker-compose ps
```

Do not copy over an existing `.env` or regenerate `APP_KEY` on an established environment.

## 7. Database Persistence and Reset

MySQL data persists in the `budget-tracker_mysql_data` Docker volume when containers stop or are recreated.

Normal schema updates are non-destructive:

```powershell
docker-compose exec api php artisan migrate
```

### Destructive local reset

The following permanently deletes the local MySQL database. It does not remove Composer or npm dependency volumes:

```powershell
docker-compose down
docker volume rm budget-tracker_mysql_data
docker-compose up -d
docker-compose exec api php artisan migrate --seed
```

Never run this when local data must be retained.

## 8. Troubleshooting

### Docker engine or named-pipe error

Start Docker Desktop and wait for the engine. Reopen PowerShell if the terminal still cannot access Docker.

### `docker compose` is unavailable

Use `docker-compose`. The setup script detects either version.

### Client container exits

Its dependency volume may be empty:

```powershell
docker-compose run --rm client npm ci
docker-compose up -d client
docker-compose logs client
```

### Composer extraction timeout

Retry with a longer process timeout:

```powershell
docker-compose run --rm -e COMPOSER_PROCESS_TIMEOUT=1200 api composer install --prefer-dist
```

### MySQL reports `Access denied`

MySQL applies `MYSQL_*` variables only when initializing a new volume. If an obsolete local database can be discarded, follow the destructive reset section. Otherwise, preserve it and ask the team to migrate its users safely.

### Laravel reports `tempnam()` or cannot compile Blade views

Rebuild the API image so its startup entrypoint repairs writable paths:

```powershell
docker-compose up -d --build api api_nginx
docker-compose exec api php artisan optimize:clear
```

### Orphaned Yii/Svelte containers

```powershell
docker-compose up -d --remove-orphans
```

### Port already in use

Find the listener:

```powershell
Get-NetTCPConnection -State Listen -LocalPort 5173,8080
```

Stop the conflicting application, then rerun setup.

### Collect diagnostics

```powershell
docker-compose ps -a
docker-compose logs --tail=200 client api api_nginx mysql
```

Include that output when asking the team for help.
