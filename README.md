# Todo App

A local-first, real-time todo application built with Electric SQL + TanStack DB.

## Features

- Create todos with title, optional description, and priority level (low / medium / high)
- Mark todos as complete / incomplete with instant optimistic updates
- Delete todos with a confirmation dialog
- Filter by status: All, Active, Completed
- Real-time sync across clients via Electric SQL
- Optimistic mutations for instant feedback

## Screenshot

_Preview available at your Sprite URL_

## Getting Started

```bash
pnpm install
pnpm dev:start
```

The app will be available at `http://localhost:8080`.

## Tech Stack

| Layer | Technology |
|---|---|
| Sync engine | [Electric SQL](https://electric-sql.com) |
| Reactive collections | [TanStack DB](https://tanstack.com/db) |
| Database schema & migrations | [Drizzle ORM](https://orm.drizzle.team) |
| Meta-framework | [TanStack Start](https://tanstack.com/start) |
| UI components | [Radix UI Themes](https://www.radix-ui.com/themes) |
| Database | PostgreSQL (Neon) |

## License

MIT
