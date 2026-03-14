# Todo App — Implementation Plan

## App Description
A local-first, real-time todo application built with Electric SQL + TanStack DB. Users can create, manage, and organize tasks that sync instantly across clients via Postgres-backed Electric shapes.

## Data Model

### todos
- id: UUID, primary key, defaultRandom()
- title: text, notNull
- description: text, nullable
- completed: boolean, notNull, default false
- priority: text, notNull, default "medium" (values: "low", "medium", "high")
- created_at: timestamptz, notNull, defaultNow()
- updated_at: timestamptz, notNull, defaultNow()

## Implementation Tasks
- [ ] Phase 2: Discover playbook skills and read relevant ones
- [ ] Phase 3: Data model — schema, zod-schemas, migrations, tests
- [ ] Phase 4: Collections & API routes
- [ ] Phase 5: UI components
- [ ] Phase 6: Build, lint & test
- [ ] Phase 7: README.md & ARCHITECTURE.md
- [ ] Phase 8: Deploy & preview

## Design Conventions
- UUID primary keys with defaultRandom()
- timestamp({ withTimezone: true }) for all dates
- snake_case for SQL table/column names
- Foreign keys with onDelete: "cascade" where appropriate

## Features
- Create todos with title, optional description, and priority level
- Mark todos as complete/incomplete
- Delete todos
- Filter by status (all, active, completed)
- Real-time sync across clients via Electric SQL
- Optimistic updates for instant feedback
