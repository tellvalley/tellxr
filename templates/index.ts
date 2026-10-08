import type { z } from "zod";
import emeraldSalonManifest from "./emerald-salon/template.json";
import { emeraldSalonContentSchema } from "./emerald-salon/schema";
import type { SharedContent } from "./shared-schema";

export type TemplateManifest = {
  id: string;
  name: string;
  version: number;
  eventTypes: string[];
  description: string;
  cameraStops: string[];
};

type TemplateEntry = {
  manifest: TemplateManifest;
  /** Every template schema extends the shared one, so its output is SharedContent-compatible. */
  contentSchema: z.ZodType<SharedContent>;
};

/** Every template the engine can render, keyed by id. */
export const templates: Record<string, TemplateEntry> = {
  "emerald-salon": {
    manifest: emeraldSalonManifest,
    contentSchema: emeraldSalonContentSchema,
  },
};

export function getTemplate(id: string): TemplateEntry {
  const entry = templates[id];
  if (!entry) throw new Error(`Unknown template "${id}"`);
  return entry;
}

/** Validates an event's content against its template; throws with the failing field. */
export function parseContent(templateId: string, content: unknown): SharedContent {
  return getTemplate(templateId).contentSchema.parse(content);
}
