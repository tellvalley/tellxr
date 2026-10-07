"use client";

import { useLoader } from "@react-three/fiber";
import { useEffect, useMemo } from "react";
import { CanvasTexture, Color, SRGBColorSpace, TextureLoader, type Texture } from "three";
import type { TemplateSceneProps, Vec3 } from "@/engine/types";
import { layers } from "./layout";
import type { SpotlightStageContent } from "./schema";

/**
 * Spotlight Stage: photographic layers at different depths (2.5D).
 * Back to front: stage backdrop, couple cut-out with a floor shadow,
 * left plant, right plant. Photos are unlit so their own lighting shows.
 */
export function SpotlightStageScene({ content }: TemplateSceneProps<SpotlightStageContent>) {
  const [backdrop, couple, plantLeft, plantRight] = useLoader(TextureLoader, [
    layers.backdrop.src,
    content.couplePhoto.src,
    layers.plantLeft.src,
    layers.plantRight.src,
  ]);

  useEffect(() => {
    for (const t of [backdrop, couple, plantLeft, plantRight]) {
      t.colorSpace = SRGBColorSpace;
      t.anisotropy = 4;
      t.needsUpdate = true;
    }
  }, [backdrop, couple, plantLeft, plantRight]);

  const background = useMemo(() => new Color(content.palette.background), [content.palette.background]);

  // Couple plane keeps the event photo's aspect ratio.
  const coupleImage = couple.image as { width: number; height: number };
  const coupleHeight = layers.couple.height;
  const coupleWidth = coupleHeight * (coupleImage.width / coupleImage.height);
  const [cx, , cz] = layers.couple.position;

  return (
    <>
      <color attach="background" args={[background]} />

      <PhotoLayer texture={backdrop} size={layers.backdrop.size} position={layers.backdrop.position} order={0} />

      <FloorShadow position={[cx, 0.002, cz + 0.05]} width={coupleWidth * 1.15} />
      <PhotoLayer
        texture={couple}
        size={[coupleWidth, coupleHeight]}
        position={[cx, coupleHeight / 2, cz]}
        order={2}
      />

      <PhotoLayer texture={plantLeft} size={layers.plantLeft.size} position={layers.plantLeft.position} order={3} />
      <PhotoLayer texture={plantRight} size={layers.plantRight.size} position={layers.plantRight.position} order={4} />
    </>
  );
}

function PhotoLayer({
  texture,
  size,
  position,
  order,
}: {
  texture: Texture;
  size: [number, number];
  position: Vec3;
  order: number;
}) {
  return (
    <mesh position={position} renderOrder={order}>
      <planeGeometry args={size} />
      <meshBasicMaterial map={texture} transparent toneMapped={false} depthWrite={order === 0} />
    </mesh>
  );
}

/** A soft oval shadow so the couple sits on the floor instead of floating. */
function FloorShadow({ position, width }: { position: Vec3; width: number }) {
  const texture = useMemo(() => {
    const size = 128;
    const canvas = document.createElement("canvas");
    canvas.width = canvas.height = size;
    const ctx = canvas.getContext("2d");
    if (ctx) {
      const g = ctx.createRadialGradient(size / 2, size / 2, 0, size / 2, size / 2, size / 2);
      g.addColorStop(0, "rgba(0,0,0,0.6)");
      g.addColorStop(1, "rgba(0,0,0,0)");
      ctx.fillStyle = g;
      ctx.fillRect(0, 0, size, size);
    }
    return new CanvasTexture(canvas);
  }, []);

  return (
    <mesh position={position} rotation-x={-Math.PI / 2} renderOrder={1}>
      <planeGeometry args={[width, width * 0.35]} />
      <meshBasicMaterial map={texture} transparent depthWrite={false} toneMapped={false} />
    </mesh>
  );
}
