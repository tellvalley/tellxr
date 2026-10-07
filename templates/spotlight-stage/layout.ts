import type { CameraStop, EnvelopeArt, Vec3 } from "@/engine/types";

const base = "/templates/spotlight-stage";

/**
 * 2.5D layers (metres; floor at y = 0, camera looks towards -z).
 * Each photo is a flat plane; their different depths create parallax.
 * `size` is [width, height]; `position` is the plane's centre.
 */
export const layers = {
  backdrop: {
    src: `${base}/backdrop.webp`,
    // Large enough to fill the view from every camera stop.
    size: [22.5, 15] as [number, number],
    position: [0, 2.7, -9] as Vec3,
  },
  couple: {
    // Height of the cut-out; width follows the event photo's aspect ratio.
    height: 1.8,
    position: [0, 0, -2] as Vec3,
  },
  plantLeft: {
    src: `${base}/plant-left.webp`,
    size: [1.45, 1.45] as [number, number],
    position: [-1.05, 0.725, 0.4] as Vec3,
  },
  plantRight: {
    src: `${base}/plant-right.webp`,
    size: [2.1, 2.63] as [number, number],
    position: [1.45, 0.75, 2.3] as Vec3,
  },
};

export const spotlightStageStops: Record<string, CameraStop> = {
  envelope: { position: [0, 1.6, 7.5], target: [0, 1.6, -9] },
  room: { position: [0, 1.45, 3.9], target: [0, 1.5, -9] },
  // Story: drift around the stage so the plants and couple shift against the backdrop.
  "story-1": { position: [-1.5, 1.75, 3.6], target: [-3, 2.4, -9] },
  "story-2": { position: [0.8, 1.6, 4.4], target: [2.6, 2, -9] },
  "story-3": { position: [0.35, 1.45, 1.4], target: [0, 1.25, -2] },
  "story-4": { position: [-0.5, 2, 2.8], target: [0.3, 3.6, -9] },
  card: { position: [0, 1.15, 0.6], target: [0, 1, -2] },
};

export const spotlightStageEnvelope: EnvelopeArt = {
  src: `${base}/envelope.webp`,
  width: 900,
  height: 1350,
  ink: "#3d352e",
  textAt: 0.4,
  sealAt: 0.7,
};
