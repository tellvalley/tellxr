"use client";

import { useFrame, useThree } from "@react-three/fiber";
import gsap from "gsap";
import { useEffect, useRef } from "react";
import { Vector3 } from "three";
import type { CameraStop } from "./types";

type Props = {
  stops: Record<string, CameraStop>;
  active: string;
  /** Seconds for a camera flight; 0 jumps instantly (reduced motion). */
  duration: number;
  onArrive?: (stop: string) => void;
};

/**
 * Flies the camera between a template's named stops.
 * Position and look-at target are tweened together so the camera turns
 * smoothly instead of snapping its gaze.
 */
export function CameraRig({ stops, active, duration, onArrive }: Props) {
  const camera = useThree((s) => s.camera);
  const target = useRef(new Vector3());
  const placed = useRef(false);

  useEffect(() => {
    const stop = stops[active];
    if (!stop) return;

    // First frame: place the camera without a flight.
    if (!placed.current || duration === 0) {
      placed.current = true;
      camera.position.set(...stop.position);
      target.current.set(...stop.target);
      camera.lookAt(target.current);
      onArrive?.(active);
      return;
    }

    const tl = gsap.timeline({
      defaults: { duration, ease: "power2.inOut" },
      onComplete: () => onArrive?.(active),
    });
    const [px, py, pz] = stop.position;
    const [tx, ty, tz] = stop.target;
    tl.to(camera.position, { x: px, y: py, z: pz }, 0);
    tl.to(target.current, { x: tx, y: ty, z: tz }, 0);

    return () => {
      tl.kill();
    };
  }, [active, camera, duration, onArrive, stops]);

  useFrame(() => {
    camera.lookAt(target.current);
  });

  return null;
}
