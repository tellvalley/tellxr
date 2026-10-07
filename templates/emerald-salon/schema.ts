import { z } from "zod";
import { hexColor } from "@/lib/event-schema";

/**
 * Slots the Emerald Salon template asks hosts to fill.
 * Positions, scales and camera stops are NOT here: they belong to the
 * template's scene, so hosts can never break the layout.
 */
export const emeraldSalonContentSchema = z.object({
  palette: z.object({
    primary: hexColor,
    background: hexColor,
  }),
  coverImage: z.string().optional(),
  couplePhoto: z
    .object({
      src: z.string(),
      framing: z.enum(["full", "half", "close"]).default("half"),
    })
    .optional(),
  story: z
    .array(
      z.object({
        title: z.string().min(1).max(40),
        body: z.string().min(1).max(140),
      }),
    )
    .max(4)
    .default([]),
  dressCode: z.string().max(60).optional(),
  music: z
    .object({
      src: z.string(),
      credit: z.string().max(80),
    })
    .optional(),
  features: z
    .object({
      gallery: z.boolean().default(false),
      registry: z.boolean().default(false),
    })
    .default({ gallery: false, registry: false }),
  links: z
    .object({
      gallery: z.url().optional(),
      registry: z.url().optional(),
    })
    .default({}),
});

export type EmeraldSalonContent = z.infer<typeof emeraldSalonContentSchema>;
