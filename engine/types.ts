import type { ComponentType } from "react";

export type Vec3 = [number, number, number];

/** Where the camera sits and what it looks at for one named stop. */
export type CameraStop = {
  position: Vec3;
  target: Vec3;
};

/** Rendering quality chosen for this device; "none" means use the 2D fallback. */
export type QualityTier = "high" | "low" | "none";

/** A story panel as the engine sees it. Text is shown in HTML, never in 3D. */
export type StoryPanel = { title: string; body: string };

/** What every template scene receives from the engine. */
export type TemplateSceneProps<Content = unknown> = {
  content: Content;
  stage: Stage;
  storyIndex: number;
  storyCount: number;
  tier: Exclude<QualityTier, "none">;
};

/**
 * A template's envelope artwork, shown as an HTML layer over the scene.
 * The artwork carries no text: names and the monogram are added from data.
 */
export type EnvelopeArt = {
  src: string;
  width: number;
  height: number;
  /** Ink colour for text printed on the envelope. */
  ink: string;
  /** Vertical centre of the text block and of the seal, as fractions of the height. */
  textAt: number;
  sealAt: number;
};

/** Client-side half of a template: its scene and its camera stops. */
export type ClientTemplate<Content = unknown> = {
  Scene: ComponentType<TemplateSceneProps<Content>>;
  /** HTML envelope; templates without one draw their envelope in the scene. */
  envelope?: EnvelopeArt;
  /**
   * Named stops: "envelope", "room", "story-1"…"story-4", "card".
   * Templates must define all of these; story stops beyond the event's story count are unused.
   */
  stops: Record<string, CameraStop>;
};

export const stages = ["envelope", "room", "story", "card"] as const;
export type Stage = (typeof stages)[number];
