"use client";

import { useFrame, useLoader } from "@react-three/fiber";
import { useMemo, useRef } from "react";
import {
  CanvasTexture,
  Color,
  MathUtils,
  Object3D,
  SRGBColorSpace,
  TextureLoader,
  type Mesh,
  type MeshStandardMaterial,
  type Texture,
} from "three";
import type { TemplateSceneProps, Vec3 } from "@/engine/types";
import type { EmeraldSalonContent } from "./schema";
import { layout } from "./stops";

/**
 * Emerald Salon, M2 placeholder geometry.
 * Simple shapes stand in for the Figma/3D assets that arrive in M3;
 * positions and camera stops are already final-ish so motion can be tuned now.
 */
export function EmeraldSalonScene({
  content,
  stage,
  storyIndex,
  storyCount,
  tier,
}: TemplateSceneProps<EmeraldSalonContent>) {
  const colors = useMemo(() => {
    const bg = new Color(content.palette.background);
    const primary = new Color(content.palette.primary);
    return {
      bg,
      primary,
      wall: bg.clone().lerp(new Color("#ffffff"), 0.08),
      panel: bg.clone().lerp(new Color("#ffffff"), 0.16),
      floor: new Color("#3b2a1f"),
      ivory: new Color("#f3ece0"),
      silhouette: new Color("#141414"),
    };
  }, [content.palette.background, content.palette.primary]);

  // A spotlight aims at an object that must itself be in the scene.
  const spotTarget = useMemo(() => new Object3D(), []);

  return (
    <>
      <color attach="background" args={[colors.bg.clone().multiplyScalar(0.55)]} />
      <fog attach="fog" args={[colors.bg.clone().multiplyScalar(0.55), 7, 16]} />

      {/* Light: warm and low, like an evening salon */}
      <ambientLight intensity={0.8} color="#fff3e0" />
      {/* Soft fill from the entrance so the envelope and room read clearly */}
      <directionalLight position={[0, 3, 9]} intensity={1.4} color="#fff1dc" />
      <hemisphereLight args={["#ffe9c4", "#1a120c", 0.6]} />
      <primitive object={spotTarget} position={[layout.couple[0], 1, layout.couple[2]]} />
      <spotLight
        position={[0, 4.6, 1]}
        angle={0.5}
        penumbra={0.8}
        intensity={30}
        distance={10}
        color="#ffe2b0"
        target={spotTarget}
      />
      {tier === "high" ? (
        <pointLight
          position={[layout.lamp[0], 1.9, layout.lamp[2]]}
          intensity={6}
          distance={6}
          color="#ffb866"
        />
      ) : null}

      <Room colors={colors} />
      <Lamp colors={colors} />
      <GoldFrame colors={colors} />
      {content.couplePhoto ? (
        <CouplePhoto src={content.couplePhoto.src} />
      ) : (
        <CouplePlaceholder colors={colors} />
      )}
      <Plants />
      <StoryBoards
        colors={colors}
        count={storyCount}
        active={stage === "story" ? storyIndex : -1}
      />
      <Table colors={colors} />
    </>
  );
}

type Colors = {
  bg: Color;
  primary: Color;
  wall: Color;
  panel: Color;
  floor: Color;
  ivory: Color;
  silhouette: Color;
};

function Room({ colors }: { colors: Colors }) {
  const wallPanels = [-3.4, -1.15, 1.15, 3.4];
  return (
    <group>
      {/* Floor */}
      <mesh rotation-x={-Math.PI / 2} position={[0, 0, 0.5]}>
        <planeGeometry args={[10, 10]} />
        <meshStandardMaterial color={colors.floor} roughness={0.6} />
      </mesh>
      {/* Back and side walls */}
      <mesh position={[0, 2.5, -4]}>
        <planeGeometry args={[10, 5]} />
        <meshStandardMaterial color={colors.wall} roughness={0.9} />
      </mesh>
      <mesh position={[-5, 2.5, 0.5]} rotation-y={Math.PI / 2}>
        <planeGeometry args={[9, 5]} />
        <meshStandardMaterial color={colors.wall} roughness={0.9} />
      </mesh>
      <mesh position={[5, 2.5, 0.5]} rotation-y={-Math.PI / 2}>
        <planeGeometry args={[9, 5]} />
        <meshStandardMaterial color={colors.wall} roughness={0.9} />
      </mesh>
      {/* Raised wall panels on the back wall */}
      {wallPanels.map((x) => (
        <mesh key={x} position={[x, 1.25, -3.97]}>
          <boxGeometry args={[1.9, 1.6, 0.04]} />
          <meshStandardMaterial color={colors.panel} roughness={0.8} />
        </mesh>
      ))}
      {/* Gold dado rail */}
      <mesh position={[0, 2.15, -3.95]}>
        <boxGeometry args={[10, 0.05, 0.06]} />
        <meshStandardMaterial color={colors.primary} metalness={0.3} roughness={0.4} />
      </mesh>
    </group>
  );
}

function Lamp({ colors }: { colors: Colors }) {
  const [x, , z] = layout.lamp;
  return (
    <group position={[x, 0, z]}>
      <mesh position={[0, 0.85, 0]}>
        <cylinderGeometry args={[0.025, 0.025, 1.7, 8]} />
        <meshStandardMaterial color={colors.primary} metalness={0.3} roughness={0.4} />
      </mesh>
      <mesh position={[0, 1.9, 0]}>
        <cylinderGeometry args={[0.22, 0.32, 0.4, 24, 1, true]} />
        <meshStandardMaterial color="#fff1d6" emissive="#ffcf8a" emissiveIntensity={1.6} side={2} />
      </mesh>
    </group>
  );
}

function GoldFrame({ colors }: { colors: Colors }) {
  return (
    <group position={layout.frame}>
      <mesh>
        <boxGeometry args={[1.25, 1.55, 0.06]} />
        <meshStandardMaterial color={colors.primary} metalness={0.3} roughness={0.35} />
      </mesh>
      <mesh position={[0, 0, 0.035]}>
        <planeGeometry args={[1.05, 1.35]} />
        <meshStandardMaterial color={colors.panel} roughness={1} />
      </mesh>
    </group>
  );
}

/** Two standing silhouettes, used when an event has no couple photo yet. */
function CouplePlaceholder({ colors }: { colors: Colors }) {
  const [x, , z] = layout.couple;
  return (
    <group position={[x, 0, z]}>
      {[-0.28, 0.28].map((offset) => (
        <group key={offset} position={[offset, 0, 0]}>
          <mesh position={[0, 0.8, 0]}>
            <capsuleGeometry args={[0.24, 1.0, 6, 12]} />
            <meshStandardMaterial color={colors.silhouette} roughness={0.7} />
          </mesh>
          <mesh position={[0, 1.62, 0]}>
            <sphereGeometry args={[0.15, 16, 16]} />
            <meshStandardMaterial color={colors.silhouette} roughness={0.7} />
          </mesh>
        </group>
      ))}
      {/* Soft floor shadow */}
      <mesh rotation-x={-Math.PI / 2} position={[0, 0.01, 0]}>
        <circleGeometry args={[0.9, 32]} />
        <meshBasicMaterial color="#000000" transparent opacity={0.35} />
      </mesh>
    </group>
  );
}

function StoryBoards({
  colors,
  count,
  active,
}: {
  colors: Colors;
  count: number;
  active: number;
}) {
  return (
    <>
      {layout.storyBoards.slice(0, count).map((b, i) => (
        <group key={i} position={b.position} rotation-y={b.rotationY}>
          <mesh>
            <boxGeometry args={[1.5, 1.05, 0.04]} />
            <meshStandardMaterial color={colors.primary} metalness={0.3} roughness={0.4} />
          </mesh>
          <BoardFace colors={colors} lit={i === active} />
        </group>
      ))}
    </>
  );
}

/** The board's face brightens while its story is being read. */
function BoardFace({ colors, lit }: { colors: Colors; lit: boolean }) {
  const mat = useRef<MeshStandardMaterial>(null);
  useFrame((_, dt) => {
    if (!mat.current) return;
    mat.current.emissiveIntensity = MathUtils.damp(
      mat.current.emissiveIntensity,
      lit ? 0.35 : 0.04,
      4,
      dt,
    );
  });
  return (
    <mesh position={[0, 0, 0.025]}>
      <planeGeometry args={[1.38, 0.93]} />
      <meshStandardMaterial
        ref={mat}
        color={colors.ivory}
        emissive={colors.ivory}
        emissiveIntensity={0.04}
        roughness={1}
      />
    </mesh>
  );
}

function Table({ colors }: { colors: Colors }) {
  return (
    <group position={layout.table}>
      <mesh position={[0, 0.74, 0]}>
        <cylinderGeometry args={[0.85, 0.85, 0.05, 40]} />
        <meshStandardMaterial color="#2a1c13" roughness={0.45} />
      </mesh>
      <mesh position={[0, 0.37, 0]}>
        <cylinderGeometry args={[0.06, 0.1, 0.72, 12]} />
        <meshStandardMaterial color={colors.primary} metalness={0.3} roughness={0.4} />
      </mesh>
      {/* The physical card; its readable content is the HTML overlay */}
      <mesh position={[0, 0.775, 0]} rotation-x={-Math.PI / 2}>
        <planeGeometry args={[0.42, 0.6]} />
        <meshStandardMaterial color={colors.ivory} roughness={1} />
      </mesh>
    </group>
  );
}

/** The event's couple cut-out, lit by the room so it sits in the scene. */
function CouplePhoto({ src }: { src: string }) {
  const texture = usePhoto(src);
  const image = texture.image as { width: number; height: number };
  const height = layout.coupleHeight;
  const width = height * (image.width / image.height);
  const [x, , z] = layout.couple;
  return (
    <>
      <FloorShadow position={[x, 0.006, z + 0.05]} width={width * 1.2} />
      <PhotoCutout texture={texture} size={[width, height]} position={[x, height / 2, z]} faceCamera />
    </>
  );
}

function Plants() {
  const [left, right] = useLoader(PhotoLoader, [layout.plants[0].src, layout.plants[2].src]);
  return (
    <>
      {layout.plants.map((p, i) => (
        <PhotoCutout
          key={i}
          texture={p.src === layout.plants[0].src ? left : right}
          size={p.size}
          position={p.position}
          mirror={p.mirror}
          // Corner plants turn to the camera; the foreground plant stays a fixed frame.
          faceCamera={i < 2}
        />
      ))}
    </>
  );
}

/** Loads photos as sRGB colour (otherwise they look washed out). */
class PhotoLoader extends TextureLoader {
  load(
    url: string,
    onLoad?: (texture: Texture<HTMLImageElement>) => void,
    onProgress?: (event: ProgressEvent) => void,
    onError?: (err: unknown) => void,
  ): Texture<HTMLImageElement> {
    return super.load(
      url,
      (texture) => {
        texture.colorSpace = SRGBColorSpace;
        texture.anisotropy = 4;
        onLoad?.(texture);
      },
      onProgress,
      onError,
    );
  }
}

function usePhoto(src: string): Texture {
  return useLoader(PhotoLoader, src);
}

/**
 * A photo with a transparent background as a standing plane. Lit by the room
 * (with a little self-light so it never goes muddy). `faceCamera` turns it
 * around its vertical axis towards the viewer, so it never looks paper-thin.
 */
function PhotoCutout({
  texture,
  size,
  position,
  mirror = false,
  faceCamera = false,
}: {
  texture: Texture;
  size: [number, number];
  position: Vec3;
  mirror?: boolean;
  faceCamera?: boolean;
}) {
  const mesh = useRef<Mesh>(null);
  useFrame(({ camera }) => {
    if (!faceCamera || !mesh.current) return;
    const m = mesh.current;
    m.rotation.y = Math.atan2(camera.position.x - m.position.x, camera.position.z - m.position.z);
  });
  return (
    <mesh ref={mesh} position={position} scale={[mirror ? -1 : 1, 1, 1]}>
      <planeGeometry args={size} />
      <meshStandardMaterial
        map={texture}
        emissiveMap={texture}
        emissive="#ffffff"
        emissiveIntensity={0.45}
        roughness={1}
        metalness={0}
        transparent
        alphaTest={0.05}
        side={2}
      />
    </mesh>
  );
}

/** A soft oval shadow so the couple stands on the floor instead of floating. */
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
    <mesh position={position} rotation-x={-Math.PI / 2}>
      <planeGeometry args={[width, width * 0.4]} />
      <meshBasicMaterial map={texture} transparent depthWrite={false} />
    </mesh>
  );
}
