import { z } from "zod";

/**
 * Event content contract.
 *
 * Everything here is generic to any event type (wedding, birthday, concert…).
 * Template-specific slots live under `content` and are validated by the
 * template's own schema (see templates/<id>/schema.ts).
 */

const hexColor = z
  .string()
  .regex(/^#[0-9a-fA-F]{6}$/, "Use a 6-digit hex colour like #C9A227");

export const eventTypes = ["wedding"] as const;
// Later: "birthday", "launch", "concert", "corporate"…

export const hostRoles = [
  "bride",
  "groom",
  "partner",
  "celebrant",
  "organiser",
  "artist",
] as const;

export const hostSchema = z.object({
  displayName: z.string().min(1).max(40),
  role: z.enum(hostRoles),
});

export const venueSchema = z.object({
  name: z.string().min(1).max(80),
  address: z.string().min(1).max(160),
  mapUrl: z.url().or(z.literal("")).default(""),
});

export const eventSchema = z.object({
  slug: z
    .string()
    .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, "Lowercase letters, numbers and dashes only"),
  type: z.enum(eventTypes),
  status: z.enum(["draft", "published", "archived"]),
  template: z.object({
    id: z.string().min(1),
    version: z.number().int().positive(),
  }),
  hosts: z.array(hostSchema).min(1).max(4),
  title: z.string().min(1).max(80),
  startsAt: z.iso.datetime({ offset: true }),
  timezone: z.string().min(1),
  venue: venueSchema,
  rsvpDeadline: z.iso.date(),
  /** Template slot values. Shape is checked by the template's schema. */
  content: z.record(z.string(), z.unknown()),
});

export type EventConfig = z.infer<typeof eventSchema>;
export type Host = z.infer<typeof hostSchema>;

export { hexColor };
