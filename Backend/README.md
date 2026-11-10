# Student Profile API

Laravel 12 JSON API for the React student portal. API paths are prefixed with
`/api`; private endpoints use Sanctum bearer tokens.

## Local setup

From `Backend/`:

```sh
composer install
copy .env.example .env
php artisan key:generate
php artisan migrate --seed
php artisan serve --port=8000
```

The seed creates demo records only in `local` and `testing` environments:

- Email or student number: `student.demo@example.com` or `2024-0001`
- Password: `Student123!`

Change or remove the demo account before using the database outside local
development. Configure `DB_CONNECTION`/database values in `.env` as needed.
Set `FRONTEND_URL` to the React app origin for password-reset links, and
`CORS_ALLOWED_ORIGINS` to a comma-separated allowlist for the Vite frontend.

From `frontend/`, set `VITE_API_URL=http://localhost:8000/api` in
`.env.local`, then start Vite with `npm run dev`.

## API endpoints

### Public

| Method | Path | Purpose |
|---|---|---|
| POST | `/api/auth/register` | Register a student and profile |
| POST | `/api/auth/login` | Login with email/student number and password; returns a 30-day bearer token |
| POST | `/api/auth/password/forgot` | Send a password reset email without disclosing whether the email is registered |
| POST | `/api/auth/password/reset` | Reset a password using its emailed token |

### Authenticated (`Authorization: Bearer <token>`)

| Method | Path | Purpose |
|---|---|---|
| POST | `/api/auth/logout` | Revoke the current token |
| GET | `/api/auth/me` | Current account and student profile |
| GET | `/api/dashboard` | Dashboard cards, today’s schedule, subjects, assignments, announcements |
| GET / PUT | `/api/profile` | Read or update student profile |
| GET | `/api/subjects?status=enrolled\|completed` | Enrolled or completed subjects |
| GET | `/api/schedules` | Student class schedule |
| GET | `/api/announcements?category=Academic` | Published announcements |
| GET | `/api/notifications?unread=1` | Notifications and unread count |
| PATCH | `/api/notifications/{id}/read` | Mark one notification read |
| PATCH | `/api/notifications/read-all` | Mark all notifications read |
| GET | `/api/assignments` | Student assignments |
| PATCH | `/api/assignments/{id}/complete` | Mark an assignment complete |
| GET / POST | `/api/documents` | List or upload a PDF/JPG/PNG student document (max 5 MB) |
| GET | `/api/documents/{id}/download` | Download an owned document |
| GET / PATCH | `/api/settings` | Read/update account and student details |

Validation errors return JSON with HTTP 422. Unauthenticated requests return
HTTP 401. Student documents are stored on Laravel's private local disk.
Configure Laravel's `MAIL_*` settings in `.env` to deliver reset emails. For
local development, the default mail log writes the reset link to Laravel's log.

## Data model

The schema includes users, student profiles, subjects, term-specific
enrollments, class schedules, announcements, per-user notifications,
assignments and completion status, uploaded student documents, and Sanctum
personal access tokens.

Run tests with:

```sh
php artisan test
```
