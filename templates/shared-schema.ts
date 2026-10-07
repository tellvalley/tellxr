import { z } from "zod";
import { hexColor } from "@/lib/event-schema";

/** Wax seal styles; images live in public/seals/<id>.webp. Shared by every template. */
export const sealIds = ["brick", "scarlet", "vermilion", "silver", "berry", "gold"] as const;
export type SealId = (typeof sealIds)[number];

/** A path under /public or a full URL. */
const mediaSrc = z.string().regex(/^(\/|https:\/\/)/, "Use a /path or an https:// URL");

/**
 * Slots every template understands. A template schema extends this with its
 * own slots, and may make optional ones required (see Spotlight Stage).
 */
export const sharedContentSchema = z.object({
  palette: z.object({
    primary: hexColor,
    background: hexColor,
  }),
  seal: z.enum(sealIds).default("gold"),
  coverImage: mediaSrc.optional(),
  couplePhoto: z
    .object({
      src: mediaSrc,
      framing: z.enum(["full", "half", "close"]).default("full"),
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
      src: mediaSrc,
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

export type SharedContent = z.infer<typeof sharedContentSchema>;
