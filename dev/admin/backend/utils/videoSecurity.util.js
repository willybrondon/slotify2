const fs = require('fs');
const path = require('path');
const { validateImageFile, sanitizeImageFile } = require('./imageSecurity.util');

const MAX_VIDEO_BYTES = 50 * 1024 * 1024;
const ALLOWED_VIDEO_MIME = new Set([
  'video/mp4',
  'video/quicktime',
  'video/webm',
  'video/3gpp',
  'video/x-matroska',
]);

/**
 * Detect video container from magic bytes.
 */
function detectVideoType(buffer) {
  if (!buffer || buffer.length < 12) return null;

  // WebM / Matroska: 1A 45 DF A3
  if (buffer[0] === 0x1a && buffer[1] === 0x45 && buffer[2] === 0xdf && buffer[3] === 0xa3) {
    return 'video/webm';
  }

  // MP4/MOV: ....ftyp
  if (buffer.length >= 8 && buffer.toString('ascii', 4, 8) === 'ftyp') {
    return 'video/mp4';
  }

  // 3GP
  if (buffer.length >= 8 && buffer.toString('ascii', 4, 8) === '3gp') {
    return 'video/3gpp';
  }

  return null;
}

function validateVideoFile(filePath, declaredMime) {
  if (!filePath || !fs.existsSync(filePath)) {
    return { ok: false, error: 'Video file not found' };
  }

  const stat = fs.statSync(filePath);
  if (stat.size === 0) {
    return { ok: false, error: 'Empty video file' };
  }
  if (stat.size > MAX_VIDEO_BYTES) {
    return { ok: false, error: 'Video exceeds maximum size (50MB). Try a shorter screen recording.' };
  }

  const fd = fs.openSync(filePath, 'r');
  try {
    const header = Buffer.alloc(32);
    fs.readSync(fd, header, 0, 32, 0);
    const detected = detectVideoType(header);
    if (!detected || !ALLOWED_VIDEO_MIME.has(detected)) {
      return { ok: false, error: 'Only MP4, MOV, WebM and 3GP videos are allowed' };
    }
    if (declaredMime && declaredMime.startsWith('video/') && !ALLOWED_VIDEO_MIME.has(declaredMime)) {
      return { ok: false, error: 'Invalid video content type' };
    }
    return { ok: true, mime: detected };
  } finally {
    fs.closeSync(fd);
  }
}

function getVideoDurationSec(filePath) {
  return new Promise((resolve, reject) => {
    let ffmpeg;
    let ffprobePath;
    try {
      ffmpeg = require('fluent-ffmpeg');
      const ffmpegStatic = require('ffmpeg-static');
      if (ffmpegStatic) {
        ffmpeg.setFfmpegPath(ffmpegStatic);
        ffprobePath = require('ffprobe-static');
        if (ffprobePath) ffmpeg.setFfprobePath(ffprobePath);
      }
    } catch (err) {
      reject(new Error('Video processing is not available on this server'));
      return;
    }

    ffmpeg.ffprobe(filePath, (err, metadata) => {
      if (err) return reject(err);
      const dur = metadata?.format?.duration;
      resolve(typeof dur === 'number' && dur > 0 ? dur : 3);
    });
  });
}

function extractFrameAt(videoPath, outputPath, timeSec) {
  return new Promise((resolve, reject) => {
    let ffmpeg;
    try {
      ffmpeg = require('fluent-ffmpeg');
      const ffmpegStatic = require('ffmpeg-static');
      if (ffmpegStatic) ffmpeg.setFfmpegPath(ffmpegStatic);
    } catch (err) {
      reject(new Error('Video processing is not available on this server'));
      return;
    }

    ffmpeg(videoPath)
      .seekInput(Math.max(0, timeSec))
      .frames(1)
      .outputOptions(['-q:v', '2'])
      .output(outputPath)
      .on('end', () => resolve(outputPath))
      .on('error', (e) => reject(e))
      .run();
  });
}

/**
 * Extract up to 3 JPEG frames from a screen recording for look analysis.
 * @returns {Promise<string[]>} paths to extracted frame images
 */
async function extractVideoFrames(videoPath, maxFrames = 3) {
  const validation = validateVideoFile(videoPath);
  if (!validation.ok) {
    throw new Error(validation.error || 'Invalid video');
  }

  let duration = 3;
  try {
    duration = await getVideoDurationSec(videoPath);
  } catch (e) {
    console.warn('[Video] ffprobe failed, using default duration:', e.message);
  }

  const capped = Math.min(duration, 60);
  const times =
    capped <= 1
      ? [0.2]
      : maxFrames === 1
        ? [capped * 0.4]
        : [capped * 0.15, capped * 0.45, capped * 0.75];

  const dir = path.dirname(videoPath);
  const frames = [];

  for (let i = 0; i < times.length; i++) {
    const out = path.join(dir, `skedisy-frame-${Date.now()}-${i}.jpg`);
    await extractFrameAt(videoPath, out, times[i]);
    const frameValidation = validateImageFile(out);
    if (frameValidation.ok) {
      const sanitized = await sanitizeImageFile(out);
      if (sanitized.ok) frames.push(sanitized.path);
    }
  }

  if (!frames.length) {
    throw new Error('Could not extract a usable frame from the video. Try a screenshot instead.');
  }

  return frames;
}

function cleanupPaths(paths) {
  (paths || []).forEach((p) => {
    try {
      if (p && fs.existsSync(p)) fs.unlinkSync(p);
    } catch (_) {
      /* ignore */
    }
  });
}

module.exports = {
  MAX_VIDEO_BYTES,
  ALLOWED_VIDEO_MIME,
  validateVideoFile,
  extractVideoFrames,
  cleanupPaths,
};
