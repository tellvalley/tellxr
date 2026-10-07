import { z } from "zod";
import { sharedContentSchema } from "../shared-schema";

/**
 * Spotlight Stage puts the couple centre stage, so a cut-out photo
 * (transparent background) is required.
 */
export const spotlightStageContentSchema = sharedContentSchema.extend({
  couplePhoto: sharedContentSchema.shape.couplePhoto.unwrap(),
});

export type SpotlightStageContent = z.infer<typeof spotlightStageContentSchema>;
