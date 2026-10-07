import type { QualityTier } from "./types";

/** True when the browser can create a WebGL context. */
export function hasWebGL(): boolean {
  try {
    const canvas = document.createElement("canvas");
    return Boolean(canvas.getContext("webgl2") ?? canvas.getContext("webgl"));
  } catch {
    return false;
  }
}

type NavigatorWithMemory = Navigator & { deviceMemory?: number };

/**
 * First guess at a quality tier from device hints. The frame-rate monitor
 * in the experience can still drop "high" to "low" at runtime.
 */
export function initialTier(): QualityTier {
  if (!hasWebGL()) return "none";
  const nav = navigator as NavigatorWithMemory;
  const lowMemory = typeof nav.deviceMemory === "number" && nav.deviceMemory <= 4;
  const fewCores = typeof nav.hardwareConcurrency === "number" && nav.hardwareConcurrency <= 4;
  return lowMemory || fewCores ? "low" : "high";
}

/** Device pixel ratio range per tier; capped at 2 per the performance budget. */
export const dprForTier: Record<Exclude<QualityTier, "none">, [number, number]> = {
  high: [1, 2],
  low: [1, 1.25],
};
