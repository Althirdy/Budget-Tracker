# Budget Tracker

Budget Tracker is a Docker-based development stack using Laravel 12, React with TypeScript, Tailwind CSS, shadcn, Nginx, and MySQL 8.4.

## Prerequisites

Install only:

- [Git](https://git-scm.com/download/win)
- [Docker Desktop](https://www.docker.com/products/docker-desktop/) running Linux containers
- Windows PowerShell 5.1 or newer

PHP, Composer, Node, npm, Nginx, and MySQL run inside Docker and should not be installed for this project.

Ports `5173` and `8080` must be available.

## First-Time Setup

Open PowerShell and run:

```powershell
git clone https://github.com/Althirdy/Budget-Tracker.git
Set-Location Budget-Tracker
.\scripts\setup.ps1
```

The setup script creates local environment files from the committed examples, builds the images, installs dependencies inside Docker, starts all services, generates Laravel's key, and runs migrations and development seeders. Existing `.env` files, application keys, and database volumes are preserved when the script is rerun.

If PowerShell blocks the script, see [the detailed setup guide](docs/SETUP.md#powershell-execution-policy).

## Local URLs

- React client: <http://localhost:5173>
- Laravel: <http://localhost:8080>
- API health: <http://localhost:8080/api/v1/health>

Development account (local only):

- Email: `test@example.com`
- Password: `password`

## Daily Commands

This repository supports both modern `docker compose` and legacy `docker-compose`. The examples below use the command available in the current Windows environment.

```powershell
docker-compose up -d
docker-compose down
docker-compose ps
docker-compose logs -f
```

After changing a Dockerfile:

```powershell
docker-compose up -d --build
```

Run checks:

```powershell
docker-compose exec api php artisan test
docker-compose exec client npm run typecheck
docker-compose exec client npm run lint
docker-compose exec client npm run build
```

See [docs/SETUP.md](docs/SETUP.md) for environment settings, dependency management, migrations, database resets, and troubleshooting.
