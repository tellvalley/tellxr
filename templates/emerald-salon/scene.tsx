"use client";

import { useFrame } from "@react-three/fiber";
import { useMemo, useRef } from "react";
import { Color, MathUtils, Object3D, type Group, type MeshStandardMaterial } from "three";
import type { TemplateSceneProps } from "@/engine/types";
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
      <CouplePlaceholder colors={colors} />
      <StoryBoards
        colors={colors}
        count={storyCount}
        active={stage === "story" ? storyIndex : -1}
      />
      <Table colors={colors} />
      <Envelope colors={colors} opened={stage !== "envelope"} />
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

/** Two standing silhouettes where the couple photo cut-out goes in M3. */
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

/** Sealed envelope; drops away once opened. */
function Envelope({ colors, opened }: { colors: Colors; opened: boolean }) {
  const group = useRef<Group>(null);
  useFrame((_, dt) => {
    const g = group.current;
    if (!g) return;
    g.position.y = MathUtils.damp(g.position.y, opened ? layout.envelope[1] - 3 : layout.envelope[1], 3, dt);
    g.rotation.x = MathUtils.damp(g.rotation.x, opened ? -0.9 : 0, 3, dt);
    g.visible = g.position.y > layout.envelope[1] - 2.9;
  });

  return (
    <group ref={group} position={layout.envelope}>
      <mesh>
        <boxGeometry args={[0.95, 1.45, 0.02]} />
        <meshStandardMaterial color={colors.bg} roughness={0.85} />
      </mesh>
      {/* Ribbon */}
      <mesh position={[0, 0, 0.012]}>
        <planeGeometry args={[0.1, 1.45]} />
        <meshStandardMaterial color={colors.primary} metalness={0.3} roughness={0.4} />
      </mesh>
      {/* Wax seal */}
      <mesh position={[0, 0, 0.02]} rotation-x={Math.PI / 2}>
        <cylinderGeometry args={[0.1, 0.1, 0.02, 32]} />
        <meshStandardMaterial color={colors.primary} metalness={0.3} roughness={0.5} />
      </mesh>
    </group>
  );
}
