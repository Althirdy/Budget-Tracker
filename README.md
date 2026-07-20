# Tally Budget Tracker

Tally is a Docker-based budget tracker built with Laravel 12, React and TypeScript, Tailwind CSS, shadcn, Nginx, and MySQL 8.4.

Everything runs inside Docker. Do not install PHP, Composer, Node.js, npm, MySQL, or Nginx directly on Windows.

## What You Need

Install these three tools:

1. [Git for Windows](https://git-scm.com/download/win)
2. [Docker Desktop](https://www.docker.com/products/docker-desktop/)
3. Windows PowerShell 5.1 or newer

Start Docker Desktop and wait until it reports that the engine is running. Docker Desktop must use Linux containers.

## Before You Clone: Remove Old Containers

Skip this section on a clean laptop.

If you previously ran Budget Tracker, Trio Expense, or an older version of this project, open PowerShell and list matching containers:

```powershell
docker ps -a --filter "name=budget_tracker" --filter "name=trio_expense"
```

Remove only the old application containers shown in that list:

```powershell
docker rm -f budget_tracker_client budget_tracker_api budget_tracker_api_nginx budget_tracker_mysql
docker rm -f trio_expense_frontend
```

Docker may report `No such container` for names that do not exist; that is harmless. These commands remove containers but do not delete named database or dependency volumes.

Do not run `docker system prune`, `docker volume prune`, or delete volumes during normal onboarding. Those commands can remove unrelated projects or local database data.

## Clone and Start

Open PowerShell:

```powershell
Set-Location "$env:USERPROFILE\Desktop"
git clone https://github.com/Althirdy/Budget-Tracker.git
Set-Location Budget-Tracker
.\scripts\setup.ps1
```

The first setup can take several minutes. Wait for `Setup complete` before opening the application.

If PowerShell blocks the script:

```powershell
Set-ExecutionPolicy -Scope Process -ExecutionPolicy Bypass
.\scripts\setup.ps1
```

## Confirm It Works

Open:

- Client: <http://localhost:5173>
- API health: <http://localhost:8080/api/v1/health>

Sign in with the local development account:

```text
Email:    test@example.com
Password: password
```

Confirm all four services are running:

```powershell
docker compose ps
```

You should see `client`, `api`, `api_nginx`, and `mysql` running or healthy.

## Daily Commands

Run these from the repository root:

```powershell
docker compose up -d
docker compose ps
docker compose logs -f
docker compose down
```

`docker compose down` removes containers and the project network but preserves named volumes and MySQL data.

## Need Help?

Follow the detailed [Windows setup guide](docs/SETUP.md), including manual setup, dependency commands, database resets, and troubleshooting.

Before adding a feature, read [the architecture guide](docs/ARCHITECTURE.md).
