# Architecture

## Entities

### todos
| Column | Type | Notes |
|---|---|---|
| id | UUID | Primary key, defaultRandom() |
| title | text | Required |
| description | text | Optional |
| completed | boolean | Default false |
| priority | text | "low" / "medium" / "high", default "medium" |
| created_at | timestamptz | Auto-set |
| updated_at | timestamptz | Auto-set |

## Routes

| Route | Type | Purpose |
|---|---|---|
| `/` | Page (ssr: false) | Main todos page |
| `/api/todos` | API (GET) | Electric shape proxy for todos table |
| `/api/mutations/todos` | API (POST) | Insert new todo |
| `/api/mutations/todos/$id` | API (PATCH/DELETE) | Update or delete a todo |

## Components

| Component | File | Purpose |
|---|---|---|
| TodosPage | `src/routes/index.tsx` | Main page with filter tabs and todo list |
| TodoItem | `src/routes/index.tsx` | Single todo row with checkbox, badge, delete |
| AddTodoDialog | `src/routes/index.tsx` | Dialog for creating a new todo |

## Collection

`src/db/collections/todos.ts` — Electric-backed TanStack DB collection.

- Syncs from `/api/todos` (Electric shape proxy)
- `onInsert` → POST `/api/mutations/todos`
- `onUpdate` → PATCH `/api/mutations/todos/:id`
- `onDelete` → DELETE `/api/mutations/todos/:id`
- Each mutation returns `{ txid }` for Electric's txid handshake
