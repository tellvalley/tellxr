import type { ClientTemplate } from "@/engine/types";
import { EmeraldSalonScene } from "./emerald-salon/scene";
import { emeraldSalonStops } from "./emerald-salon/stops";

/**
 * Client-side template registry (scenes + camera stops).
 * Only imported by the 3D experience, which is loaded in the browser only.
 */
export const clientTemplates: Record<string, ClientTemplate> = {
  "emerald-salon": {
    Scene: EmeraldSalonScene as ClientTemplate["Scene"],
    stops: emeraldSalonStops,
  },
};
