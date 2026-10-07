// Turns design exports in assets-src/ (git-ignored) into web-ready WebP in public/.
// Run: npm run assets
//
// Budget (CLAUDE.md): images under 300 KB each, envelope stage under 3 MB,
// whole experience under 6 MB. The script prints sizes and fails if an image
// is over budget.

import { mkdir, stat } from "node:fs/promises";
import path from "node:path";
import sharp from "sharp";

const SRC = "assets-src";
const OUT = "public";
const MAX_BYTES = 300 * 1024;

/** One rule per output: source, destination, longest edge, quality, crop to content. */
const jobs = [
  // Wax seals: shared by every template, chosen per event.
  ...["brick", "scarlet", "vermilion", "silver", "berry", "gold"].map((id) => ({
    src: `seals/${id}.png`,
    out: `seals/${id}.webp`,
    width: 360,
    quality: 82,
    trim: true,
  })),

  // Spotlight Stage template.
  { src: "spotlight-stage/envelope.png", out: "templates/spotlight-stage/envelope.webp", width: 900, quality: 80 },
  { src: "spotlight-stage/backdrop.png", out: "templates/spotlight-stage/backdrop.webp", width: 2400, quality: 82 },
  { src: "spotlight-stage/plant-left.png", out: "templates/spotlight-stage/plant-left.webp", width: 1100, quality: 76, trim: true },
  { src: "spotlight-stage/plant-right.png", out: "templates/spotlight-stage/plant-right.webp", width: 1200, quality: 74, trim: true },

  // Sample event media (an event's own photo, not a template asset).
  { src: "events/prodigydan-daniella/couple.png", out: "content/media/prodigydan-daniella/couple.webp", width: 1100, quality: 80, trim: true, edge: "height" },
];

async function exists(p) {
  try {
    await stat(p);
    return true;
  } catch {
    return false;
  }
}

let failed = false;
let total = 0;

for (const job of jobs) {
  const from = path.join(SRC, job.src);
  if (!(await exists(from))) {
    console.log(`skip  ${job.src} (not in ${SRC}/)`);
    continue;
  }
  const to = path.join(OUT, job.out);
  await mkdir(path.dirname(to), { recursive: true });

  let img = sharp(from);
  if (job.trim) img = img.trim({ threshold: 1 });
  const resize = job.edge === "height" ? { height: job.width } : { width: job.width };
  const info = await img
    .resize({ ...resize, withoutEnlargement: true })
    .webp({ quality: job.quality, alphaQuality: 90, effort: 6 })
    .toFile(to);

  total += info.size;
  const over = info.size > MAX_BYTES;
  failed ||= over;
  console.log(
    `${over ? "OVER" : "ok  "}  ${job.out.padEnd(52)} ${info.width}x${info.height}  ${(info.size / 1024).toFixed(0)} KB`,
  );
}

console.log(`total ${(total / 1024).toFixed(0)} KB`);
if (failed) {
  console.error("One or more images are over the 300 KB budget.");
  process.exit(1);
}
