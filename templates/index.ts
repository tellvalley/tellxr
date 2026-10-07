import type { z } from "zod";
import emeraldSalonManifest from "./emerald-salon/template.json";
import { emeraldSalonContentSchema } from "./emerald-salon/schema";

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
  contentSchema: z.ZodType;
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
