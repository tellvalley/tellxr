import type { CameraStop, Vec3 } from "@/engine/types";

/**
 * Room layout (metres). Back wall at z = -4, side walls at x = ±5,
 * entrance towards +z. The envelope floats just inside the entrance.
 */
export const layout = {
  envelope: [0, 1.6, 5.2] as Vec3,
  couple: [0, 0, -1.6] as Vec3,
  table: [1.9, 0, 1.4] as Vec3,
  frame: [2.4, 2.5, -3.95] as Vec3,
  lamp: [-3.2, 0, -2.6] as Vec3,
  /** Story boards on the side walls, in viewing order. */
  storyBoards: [
    { position: [-4.95, 1.9, -1.2] as Vec3, rotationY: Math.PI / 2 },
    { position: [4.95, 1.9, -1.2] as Vec3, rotationY: -Math.PI / 2 },
    { position: [-4.95, 1.9, 1.6] as Vec3, rotationY: Math.PI / 2 },
    { position: [4.95, 1.9, 1.6] as Vec3, rotationY: -Math.PI / 2 },
  ],
};

const board = (i: number): CameraStop => {
  const [x, y, z] = layout.storyBoards[i].position;
  // Far enough back to frame the whole board on a narrow phone screen.
  const inward = x < 0 ? 4.2 : -4.2;
  return { position: [x + inward, y + 0.1, z], target: [x, y, z] };
};

export const emeraldSalonStops: Record<string, CameraStop> = {
  envelope: { position: [0, 1.6, 6.85], target: layout.envelope },
  room: { position: [0, 1.75, 4.6], target: [0, 1.45, -2] },
  "story-1": board(0),
  "story-2": board(1),
  "story-3": board(2),
  "story-4": board(3),
  card: { position: [1.9, 2.35, 2.75], target: [1.9, 0.78, 1.4] },
};
