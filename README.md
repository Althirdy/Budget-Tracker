# Budget Tracker

Budget Tracker is a Docker-based development stack with a SvelteKit frontend, a Yii2 backend API, Nginx, and MySQL.

Use the root `docker-compose.yml` as the source of truth for local development. The generated Yii2 Compose file inside `api/` is not used for this project.

## Prerequisites

- Docker Desktop
- Standalone `docker-compose`

## First-Time Setup

From the project root, install dependencies inside Docker and start the stack:

```powershell
docker-compose run --rm frontend npm ci
docker-compose up -d --build
docker-compose exec api composer install
docker-compose exec api sh -c "mkdir -p runtime web/assets && chown -R www-data:www-data runtime web/assets"
docker-compose exec api php yii migrate --interactive=0
```

Check the stack:

```powershell
docker-compose ps
```

## Local URLs

- Frontend: `http://localhost:5173`
- Backend Yii2 app: `http://localhost:8080`
- Backend health API: `http://localhost:8080/api/v1/health`

## Daily Commands

Start the stack:

```powershell
docker-compose up -d
```

Stop the stack:

```powershell
docker-compose down
```

Check the stack:

```powershell
docker-compose ps
```

Rebuild after Dockerfile or dependency changes:

```powershell
docker-compose up -d --build
```

View service logs:

```powershell
docker-compose logs frontend
docker-compose logs api
docker-compose logs api_nginx
docker-compose logs mysql
```

Run Yii2 console commands:

```powershell
docker-compose exec api php yii
```

## Documentation

- Setup guide: [docs/SETUP.md](docs/SETUP.md)
- Code governance: [docs/CODE_GOVERNANCE.md](docs/CODE_GOVERNANCE.md)
- Git governance: [docs/GIT_GOVERNANCE.md](docs/GIT_GOVERNANCE.md)
- Git commit template: [docs/GIT_COMMIT_TEMPLATE.md](docs/GIT_COMMIT_TEMPLATE.md)

## Windows Docker Notes

If Docker commands fail with an access or pipe permission error, make sure Docker Desktop is running and your terminal has permission to access Docker. If a command fails because `docker compose` is unavailable, use `docker-compose` instead.
