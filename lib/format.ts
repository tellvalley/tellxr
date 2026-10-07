import type { EventConfig } from "@/lib/event-schema";

/** "Saturday, 12 December 2026" in the event's own time zone. */
export function formatEventDate(event: EventConfig): string {
  return new Intl.DateTimeFormat("en-GB", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
    timeZone: event.timezone,
  }).format(new Date(event.startsAt));
}

/** { weekday: "Saturday", date: "12 December 2026" } for two-line layouts. */
export function formatEventDateParts(event: EventConfig) {
  const opts = { timeZone: event.timezone } as const;
  const date = new Date(event.startsAt);
  return {
    weekday: new Intl.DateTimeFormat("en-GB", { ...opts, weekday: "long" }).format(date),
    date: new Intl.DateTimeFormat("en-GB", {
      ...opts,
      day: "numeric",
      month: "long",
      year: "numeric",
    }).format(date),
  };
}

/** "11:00 AM" in the event's own time zone. */
export function formatEventTime(event: EventConfig): string {
  return new Intl.DateTimeFormat("en-GB", {
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
    timeZone: event.timezone,
  })
    .format(new Date(event.startsAt))
    .toUpperCase();
}

/** "28 November 2026" for date-only values such as the RSVP deadline. */
export function formatPlainDate(isoDate: string): string {
  return new Intl.DateTimeFormat("en-GB", {
    day: "numeric",
    month: "long",
    year: "numeric",
    timeZone: "UTC",
  }).format(new Date(`${isoDate}T00:00:00Z`));
}

/** Host names joined for display: "ProdigyDan & Daniella". */
export function hostNames(event: EventConfig): string {
  return event.hosts.map((h) => h.displayName).join(" & ");
}
