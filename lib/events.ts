import { eventSchema, type EventConfig } from "@/lib/event-schema";
import { getTemplate } from "@/templates";

import prodigydanDaniella from "@/content/events/prodigydan-daniella.json";
import amaraTobi from "@/content/events/amara-tobi.json";

/**
 * Prototype data source: event configs checked into the repo.
 * At M5/MVP this module reads from the database instead; callers don't change.
 */
const rawEvents: unknown[] = [prodigydanDaniella, amaraTobi];

function validate(raw: unknown): EventConfig {
  const event = eventSchema.parse(raw);
  const template = getTemplate(event.template.id);
  const content = template.contentSchema.parse(event.content) as Record<string, unknown>;
  return { ...event, content };
}

// Validated once at module load, so a bad config fails the build, not a guest's visit.
const events: EventConfig[] = rawEvents.map(validate);

const bySlug = new Map(events.map((e) => [e.slug, e]));

export function listPublishedEvents(): EventConfig[] {
  return events.filter((e) => e.status === "published");
}

export function getPublishedEvent(slug: string): EventConfig | undefined {
  const event = bySlug.get(slug);
  return event?.status === "published" ? event : undefined;
}
