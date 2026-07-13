# Git Governance

This document defines how we use Git for this project.

## Branch Naming

Use short, lowercase branch names:

```text
feature/<short-description>
fix/<short-description>
docs/<short-description>
chore/<short-description>
refactor/<short-description>
```

Examples:

```text
feature/transactions-api
fix/docker-mysql-connection
docs/setup-guide
chore/gitignore
```

## Commit Message Format

Use this format:

```text
<type>(<scope>): <short summary>

<body>

<footer>
```

Allowed types:

- `feat`: user-facing feature
- `fix`: bug fix
- `docs`: documentation only
- `chore`: maintenance, tooling, config, or dependency work
- `refactor`: code restructuring without behavior changes
- `test`: test additions or updates
- `style`: formatting or visual-only changes

Common scopes:

- `frontend`
- `api`
- `docker`
- `docs`
- `db`
- `git`

Examples:

```text
feat(api): add health endpoint
docs(setup): document docker startup commands
chore(git): add root gitignore
fix(docker): point yii db config to mysql service
```

## Commit Rules

- Keep commits focused on one logical change.
- Use present tense in the summary, such as `add`, `fix`, or `document`.
- Keep the summary under 72 characters when practical.
- Mention migrations in the body when a change modifies the database schema.
- Do not commit generated dependencies or build output.
- Do not commit secrets, local `.env` files, or machine-specific config.

## Before Committing

Run the checks that match the files changed:

```powershell
docker-compose ps
docker-compose exec api php yii
docker-compose exec api php yii migrate
```

For frontend changes:

```powershell
docker-compose exec frontend npm run check
```

For API route changes, verify the endpoint through the browser or PowerShell:

```powershell
Invoke-WebRequest -UseBasicParsing http://localhost:8080/api/v1/health
```

## Pull Request Guidance

Each pull request should include:

- what changed
- how it was tested
- migration notes, if any
- screenshots for visible frontend changes
- related issue or task reference, if available

## Using The Commit Template

This repo includes a commit template at `docs/GIT_COMMIT_TEMPLATE.md`.

After Git is initialized, enable it with:

```powershell
git config commit.template docs/GIT_COMMIT_TEMPLATE.md
```
