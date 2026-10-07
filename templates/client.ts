import type { ClientTemplate } from "@/engine/types";
import { EmeraldSalonScene } from "./emerald-salon/scene";
import { emeraldSalonStops } from "./emerald-salon/stops";
import { spotlightStageEnvelope, spotlightStageStops } from "./spotlight-stage/layout";
import { SpotlightStageScene } from "./spotlight-stage/scene";

/**
 * Client-side template registry (scenes, camera stops, envelope art).
 * Only imported by the 3D experience, which is loaded in the browser only.
 */
export const clientTemplates: Record<string, ClientTemplate> = {
  "emerald-salon": {
    Scene: EmeraldSalonScene as ClientTemplate["Scene"],
    stops: emeraldSalonStops,
  },
  "spotlight-stage": {
    Scene: SpotlightStageScene as ClientTemplate["Scene"],
    stops: spotlightStageStops,
    envelope: spotlightStageEnvelope,
  },
};
