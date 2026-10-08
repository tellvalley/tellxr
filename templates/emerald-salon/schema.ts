import type { z } from "zod";
import { sharedContentSchema } from "../shared-schema";

/**
 * Slots the Emerald Salon template asks hosts to fill: the shared set as-is.
 * `couplePhoto` is optional: without one, two silhouettes stand in its place.
 * Positions, scales and camera stops are NOT here: they belong to the
 * template's scene, so hosts can never break the layout.
 */
export const emeraldSalonContentSchema = sharedContentSchema;

export type EmeraldSalonContent = z.infer<typeof emeraldSalonContentSchema>;
