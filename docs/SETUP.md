# Setup Guide

This guide is for new developers running the project with Docker Desktop or Docker Engine.

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
- Host from local database tools: `localhost`
- Port: `3306`
- Database: `yii2app`
- Username: `yii2`
- Password: `yii2pass`
- Root password: `rootpass`

## Fresh Clone Setup

After cloning, dependencies are not included in Git:

- `frontend/node_modules` is ignored and must be installed into Docker's `frontend_node_modules` volume.
- `api/vendor` is ignored and must be installed with Composer inside the API container.

From the project root, run these commands:

```powershell
docker-compose run --rm frontend npm ci
docker-compose up -d --build
docker-compose exec api composer install
docker-compose exec api sh -c "mkdir -p runtime web/assets && chown -R www-data:www-data runtime web/assets"
docker-compose exec api php yii migrate --interactive=0
docker-compose ps
```

Then verify:

Windows PowerShell:

```powershell
Invoke-WebRequest -UseBasicParsing http://localhost:5173
Invoke-WebRequest -UseBasicParsing http://localhost:8080
Invoke-WebRequest -UseBasicParsing http://localhost:8080/api/v1/health
```

Linux/macOS:

```bash
curl -i http://localhost:5173
curl -i http://localhost:8080
curl -i http://localhost:8080/api/v1/health
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

Windows PowerShell checks:

```powershell
Invoke-WebRequest -UseBasicParsing http://localhost:5173
Invoke-WebRequest -UseBasicParsing http://localhost:8080
Invoke-WebRequest -UseBasicParsing http://localhost:8080/api/v1/health
```

Linux/macOS checks:

```bash
curl -i http://localhost:5173
curl -i http://localhost:8080
curl -i http://localhost:8080/api/v1/health
```

## Daily Commands

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
