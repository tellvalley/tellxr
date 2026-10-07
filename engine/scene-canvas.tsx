"use client";

import { Canvas, useFrame } from "@react-three/fiber";
import { useRef } from "react";
import { CameraRig } from "./camera-rig";
import { dprForTier } from "./quality";
import type { ClientTemplate, Stage } from "./types";

export type SceneCanvasProps = {
  template: ClientTemplate;
  content: unknown;
  stage: Stage;
  storyIndex: number;
  storyCount: number;
  stop: string;
  tier: "high" | "low";
  flightSeconds: number;
  /** Stop rendering frames (e.g. while the card overlay covers a still scene). */
  paused: boolean;
  onReady: () => void;
  onArrive: (stop: string) => void;
  onSlow: () => void;
};

/** The WebGL canvas. Loaded only in the browser (see experience.tsx). */
export default function SceneCanvas({
  template,
  content,
  stage,
  storyIndex,
  storyCount,
  stop,
  tier,
  flightSeconds,
  paused,
  onReady,
  onArrive,
  onSlow,
}: SceneCanvasProps) {
  const { Scene, stops } = template;

  return (
    <Canvas
      dpr={dprForTier[tier]}
      frameloop={paused ? "demand" : "always"}
      camera={{ fov: 50, near: 0.1, far: 40, position: stops.envelope.position }}
      gl={{ antialias: tier === "high", powerPreference: "high-performance" }}
      onCreated={() => onReady()}
      aria-hidden
    >
      <CameraRig stops={stops} active={stop} duration={flightSeconds} onArrive={onArrive} />
      <Scene
        content={content}
        stage={stage}
        storyIndex={storyIndex}
        storyCount={storyCount}
        tier={tier}
      />
      {tier === "high" ? <FrameRateMonitor onSlow={onSlow} /> : null}
    </Canvas>
  );
}

/**
 * Averages frame rate over 2-second windows. Two slow windows in a row
 * (under 30 fps) report the device as slow so the engine can drop quality.
 */
function FrameRateMonitor({ onSlow }: { onSlow: () => void }) {
  const frames = useRef(0);
  const elapsed = useRef(0);
  const slowWindows = useRef(0);
  const reported = useRef(false);

  useFrame((_, dt) => {
    if (reported.current) return;
    frames.current += 1;
    elapsed.current += dt;
    if (elapsed.current < 2) return;

    const fps = frames.current / elapsed.current;
    frames.current = 0;
    elapsed.current = 0;
    slowWindows.current = fps < 30 ? slowWindows.current + 1 : 0;
    if (slowWindows.current >= 2) {
      reported.current = true;
      onSlow();
    }
  });

  return null;
}
