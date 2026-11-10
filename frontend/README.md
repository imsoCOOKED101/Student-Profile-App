# Student Profile Frontend

The standalone React and TypeScript app recreates the student portal UI from
the supplied reference images. It is built with Vite and connects to the
Laravel API.

## Development

```sh
npm install
copy .env.example .env.local
npm run dev
```

## Validation and production build

```sh
npm run lint
npm run build
```

## Source structure

- `src/pages/auth/` contains login, signup, account-created, and password-reset screens.
- `src/pages/portal/` contains the dashboard, student profile, subjects,
  schedule, announcements, notifications, and settings screens.
- `src/components/` contains reusable interface components.
- `src/styles/` contains global styles and Tailwind CSS setup.
- `src/App.tsx` maps screens to routes; `/` opens `/login`.
- `src/main.tsx` mounts the React application.
- `VITE_API_URL` selects the backend API base URL (default:
  `http://localhost:8000/api`).
