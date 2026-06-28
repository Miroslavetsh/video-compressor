#!/usr/bin/env node

const { spawn } = require("child_process");
const path = require("path");
const fs = require("fs");

// --- Parse CLI ---
function parseArgs() {
  const args = process.argv.slice(2);
  if (args.length < 3) {
    console.error("Usage: node index.js <input> <output> <targetMB> [--height 720] [--fps 30] [--codec h264] [--preset medium] [--audio 128]");
    process.exit(1);
  }

  const opts = {
    input: args[0],
    output: args[1],
    targetMB: Number(args[2]),
    height: undefined,
    fps: undefined,
    codec: "h264",
    preset: "medium",
    audio: 128,
  };

  for (let i = 3; i < args.length; i++) {
    if (args[i] === "--height" && args[i + 1]) opts.height = Number(args[++i]);
    else if (args[i] === "--fps" && args[i + 1]) opts.fps = Number(args[++i]);
    else if (args[i] === "--codec" && args[i + 1]) opts.codec = args[++i];
    else if (args[i] === "--preset" && args[i + 1]) opts.preset = args[++i];
    else if (args[i] === "--audio" && args[i + 1]) opts.audio = Number(args[++i]);
  }

  return opts;
}

// --- Get duration via ffprobe ---
function getDuration(inputPath) {
  return new Promise((resolve, reject) => {
    const ffprobe = spawn("ffprobe", [
      "-v", "error",
      "-show_entries", "format=duration",
      "-of", "default=noprint_wrappers=1:nokey=1",
      inputPath,
    ], { stdio: ["ignore", "pipe", "pipe"] });

    let out = "";
    let err = "";
    ffprobe.stdout.on("data", (d) => { out += d; });
    ffprobe.stderr.on("data", (d) => { err += d; });
    ffprobe.on("error", (e) => {
      if (e && e.code === "ENOENT") {
        reject(new Error("ffprobe not found. Install ffmpeg (includes ffprobe) and try again."));
        return;
      }
      reject(e);
    });
    ffprobe.on("close", (code) => {
      if (code !== 0) {
        reject(new Error(err || "ffprobe failed"));
        return;
      }
      const duration = parseFloat(out.trim());
      if (Number.isFinite(duration)) resolve(duration);
      else reject(new Error("Could not read duration: " + out));
    });
  });
}

// --- Build -vf filter string ---
function buildFilter(opts) {
  const parts = [];
  if (opts.height != null) parts.push(`scale=-2:${opts.height}`);
  if (opts.fps != null) parts.push(`fps=${opts.fps}`);
  return parts.length ? parts.join(",") : null;
}

// --- Run one FFmpeg pass (stream stderr so user sees frame=, fps=, etc.) ---
function runFFmpegPass(input, output, passNum, videoKbps, opts, filter) {
  return new Promise((resolve, reject) => {
    const passlogPrefix = path.join(path.dirname(output), path.basename(output, path.extname(output)) + "_passlog");
    const codec = opts.codec === "h264" ? "libx264" : opts.codec;

    const common = ["-y", "-i", input];
    if (filter) common.push("-vf", filter);
    common.push("-c:v", codec, "-b:v", `${videoKbps}k`, "-preset", opts.preset);

    let argv;
    if (passNum === 1) {
      argv = [...common, "-pass", "1", "-passlogfile", passlogPrefix, "-an", "-f", "null", "-"];
    } else {
      argv = [...common, "-pass", "2", "-passlogfile", passlogPrefix];
      argv.push("-c:a", "aac", "-b:a", `${opts.audio}k`, output);
    }

    const ffmpeg = spawn("ffmpeg", argv, { stdio: ["ignore", "pipe", "pipe"] });

    ffmpeg.stderr.on("data", (d) => {
      const line = d.toString();
      // FFmpeg progress goes to stderr; print so user sees frame=, fps=, bitrate=, speed=, etc.
      if (line.includes("frame=") || line.includes("size=") || line.includes("time=")) {
        process.stderr.write(d);
      }
    });
    ffmpeg.on("error", (e) => {
      if (e && e.code === "ENOENT") {
        reject(new Error("ffmpeg not found. Install ffmpeg and try again."));
        return;
      }
      reject(e);
    });

    ffmpeg.on("close", (code) => {
      if (code !== 0) reject(new Error(`FFmpeg pass ${passNum} exited with code ${code}`));
      else resolve();
    });
  });
}

async function main() {
  const opts = parseArgs();

  if (!opts.input || !opts.output || !opts.targetMB) {
    console.error("Usage: node index.js <input> <output> <targetMB> [--height 720] [--fps 30] [--codec h264] [--preset medium] [--audio 128]");
    process.exit(1);
  }

  if (!fs.existsSync(opts.input)) {
    console.error("Input file not found:", opts.input);
    process.exit(1);
  }

  const duration = await getDuration(opts.input);
  const targetBytes = opts.targetMB * 1024 * 1024;
  const audioBps = opts.audio * 1000;
  let totalBps = (targetBytes * 8) / duration;
  let videoBps = Math.max(100_000, totalBps - audioBps);
  const videoKbps = Math.floor(videoBps / 1000);

  console.log(`Duration: ${duration}s`);
  console.log(`Target size: ${opts.targetMB} MB`);
  console.log(`Audio bitrate: ${opts.audio} kbps`);
  console.log(`Calculated video bitrate: ${videoKbps} kbps`);
  console.log(`Encoding parameters:
  Codec: ${opts.codec}
  Preset: ${opts.preset}
  Height: ${opts.height ?? "keep"}
  FPS: ${opts.fps ?? "keep"}
`);

  const filter = buildFilter(opts);
  console.log("Pass 1/2 ...");
  await runFFmpegPass(opts.input, opts.output, 1, videoKbps, opts, filter);
  console.log("Pass 2/2 ...");
  await runFFmpegPass(opts.input, opts.output, 2, videoKbps, opts, filter);

  // Удаляем временные логи двух проходов
  const passlogPrefix = path.join(path.dirname(opts.output), path.basename(opts.output, path.extname(opts.output)) + "_passlog");
  try {
    if (fs.existsSync(passlogPrefix + "-0.log")) fs.unlinkSync(passlogPrefix + "-0.log");
    if (fs.existsSync(passlogPrefix + "-0.log.mbtree")) fs.unlinkSync(passlogPrefix + "-0.log.mbtree");
  } catch (_) {}

  console.log("Done!");
}

main().catch((e) => {
  console.error("Error:", e.message);
  process.exit(1);
});
