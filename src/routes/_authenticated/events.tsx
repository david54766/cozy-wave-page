import { createFileRoute, Outlet } from "@tanstack/react-router";

/**
 * Layout for /events and /events/$eventId.
 *
 * This file is the parent route for everything under /events, so it MUST render
 * an <Outlet/>. Previously it rendered the events *list* directly, which meant
 * /events/$eventId matched the child route but still painted the list — tapping
 * an event appeared to do nothing. The list now lives in events.index.tsx.
 */
export const Route = createFileRoute("/_authenticated/events")({
  component: EventsLayout,
});

function EventsLayout() {
  return <Outlet />;
}
