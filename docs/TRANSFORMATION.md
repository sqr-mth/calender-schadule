# Productivity platform implementation notes

## Existing application

The original app has a Next.js App Router root layout, a tasks route, a calendar route, Ant Design task modals, and a Zustand store persisted in localStorage. The two routes duplicated task creation and each fetched a static `/api` task list. Because that list was merged by ID after every load, deleting an example task did not persist. The form exposed only title, description, and status.

## Current foundation

The application now has a shared responsive shell and a data-backed overview. The persisted task key remains `scheduler-tasks-v2`, with a versioned migration so existing tasks are retained. Projects, goals, habits, notes, time entries, and activity are local entities in the same store. The static sample endpoint and seeding effects are removed. Task forms now accept due date, priority, project, time, and estimate. The task page includes a drag-and-drop status board.

## Architectural follow-up

The current section page combines several small modules for an initial functional slice. Split each module into its own route and component as its interactions grow. Add a storage adapter and schema validator before integrating an API, and add integration coverage for persistence, imports, scheduling, and timers. Calendar week/day views, recurring instances, notification state, advanced project editing, and full settings remain outstanding.
