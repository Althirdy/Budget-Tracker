# Setup Guide

This guide is for new developers running the project on Windows with Docker Desktop and PowerShell.

## Stack Overview

The root `docker-compose.yml` runs these services:

- `frontend`: SvelteKit development server on port `5173`
- `api`: Yii2 PHP-FPM backend container
- `api_nginx`: Nginx web server for Yii2 on port `8080`
- `mysql`: MySQL 8 database with persistent Docker volume storage

Use only the root `docker-compose.yml` for this project.

## Local Database

Local MySQL settings:

- Host from Yii2/Docker: `mysql`
- Host from Windows tools: `localhost`
- Port: `3306`
- Database: `yii2app`
- Username: `yii2`
- Password: `yii2pass`
- Root password: `rootpass`

## First-Time Setup

From the project root:

```powershell
docker-compose up -d --build
```

Confirm the containers are running:

```powershell
docker-compose ps
```

Run Yii2 migrations:

```powershell
docker-compose exec api php yii migrate
```

Confirm the Yii2 console works:

```powershell
docker-compose exec api php yii
```

## Verify URLs

Open or request these URLs:

- Frontend: `http://localhost:5173`
- Backend Yii2 app: `http://localhost:8080`
- Backend health API: `http://localhost:8080/api/v1/health`

PowerShell checks:

```powershell
Invoke-WebRequest -UseBasicParsing http://localhost:5173
Invoke-WebRequest -UseBasicParsing http://localhost:8080
Invoke-WebRequest -UseBasicParsing http://localhost:8080/api/v1/health
```

## Common Commands

Start existing containers:

```powershell
docker-compose up -d
```

Stop containers:

```powershell
docker-compose down
```

Rebuild containers:

```powershell
docker-compose up -d --build
```

Restart backend only:

```powershell
docker-compose restart api api_nginx
```

Show logs:

```powershell
docker-compose logs frontend
docker-compose logs api
docker-compose logs api_nginx
docker-compose logs mysql
```

Run a Yii2 migration:

```powershell
docker-compose exec api php yii migrate
```

Create a Yii2 migration:

```powershell
docker-compose exec api php yii migrate/create create_example_table
```

## Troubleshooting

If `docker-compose ps` reports a Docker pipe permission error, confirm Docker Desktop is running and restart PowerShell.

If port `5173`, `8080`, or `3306` is already in use, stop the conflicting local service or change the published port in the root `docker-compose.yml`.

If frontend live reload stops updating on Windows, confirm Vite polling is still enabled in `frontend/vite.config.ts`.
