import type { CameraStop, EnvelopeArt, Vec3 } from "@/engine/types";

const base = "/templates/emerald-salon";

/**
 * Room layout (metres). Back wall at z = -4, side walls at x = ±5,
 * entrance towards +z. Photo cut-outs (couple, plants) stand in the room as planes.
 */
export const layout = {
  couple: [0, 0, -1.6] as Vec3,
  table: [-1.9, 0, 1.4] as Vec3,
  frame: [2.4, 2.5, -3.95] as Vec3,
  lamp: [-3.2, 0, -2.6] as Vec3,
  /** Height of the couple cut-out (width follows the photo). */
  coupleHeight: 1.8,
  /**
   * Photographic plants. Potted plants flank the couple (the right one mirrored);
   * the large-leaf plant frames the right of the view near the entrance, its
   * cut-off bottom hidden below the floor.
   */
  plants: [
    { src: `${base}/plant-left.webp`, size: [1.6, 1.6] as [number, number], position: [-1.35, 0.8, -2.7] as Vec3, mirror: false },
    { src: `${base}/plant-left.webp`, size: [1.6, 1.6] as [number, number], position: [1.4, 0.8, -2.7] as Vec3, mirror: true },
    { src: `${base}/plant-right.webp`, size: [1.9, 2.38] as [number, number], position: [1.3, 0.75, 2.2] as Vec3, mirror: false },
  ],
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
  // Behind the HTML envelope: the room, softly blurred.
  envelope: { position: [0, 1.7, 7.2], target: [0, 1.45, -2] },
  room: { position: [0, 1.75, 4.6], target: [0, 1.45, -2] },
  "story-1": board(0),
  "story-2": board(1),
  "story-3": board(2),
  "story-4": board(3),
  card: { position: [-1.9, 2.35, 2.75], target: [-1.9, 0.78, 1.4] },
};

export const emeraldSalonEnvelope: EnvelopeArt = {
  src: `${base}/envelope.webp`,
  width: 900,
  height: 1350,
  ink: "#3d352e",
  textAt: 0.4,
  sealAt: 0.7,
};
