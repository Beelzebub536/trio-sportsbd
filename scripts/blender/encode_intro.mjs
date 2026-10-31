// Encodes the frames rendered by intro_kick.py into the web intro assets.
// Usage: node scripts/blender/encode_intro.mjs <landscape-frames-dir> <portrait-frames-dir>
// Needs ffmpeg on PATH. Writes public/intro/kick-{landscape,portrait}.{mp4,webp}.
import { execFileSync } from "node:child_process";
import { mkdirSync, statSync } from "node:fs";
import { join } from "node:path";

const [landscape, portrait] = process.argv.slice(2);
if (!landscape || !portrait) {
  console.error("Usage: node scripts/blender/encode_intro.mjs <landscape-dir> <portrait-dir>");
  process.exit(1);
}

const out = join(process.cwd(), "public", "intro");
mkdirSync(out, { recursive: true });

const ffmpeg = (...args) => execFileSync("ffmpeg", ["-y", "-loglevel", "error", ...args], { stdio: "inherit" });

for (const [name, dir] of [["landscape", landscape], ["portrait", portrait]]) {
  const frames = join(dir, "f%04d.jpg");
  // H.264 plays everywhere (iOS Safari included); faststart lets it begin before fully downloaded.
  ffmpeg("-framerate", "30", "-i", frames, "-c:v", "libx264", "-preset", "veryslow", "-crf", "27",
    "-pix_fmt", "yuv420p", "-movflags", "+faststart", "-an", join(out, `kick-${name}.mp4`));
  // First frame as the poster, shown instantly while the video loads.
  ffmpeg("-i", join(dir, "f0001.jpg"), "-quality", "80", join(out, `kick-${name}.webp`));
}

for (const file of ["landscape.mp4", "portrait.mp4", "landscape.webp", "portrait.webp"]) {
  console.log(`kick-${file}: ${Math.round(statSync(join(out, `kick-${file}`)).size / 1024)} KB`);
}
