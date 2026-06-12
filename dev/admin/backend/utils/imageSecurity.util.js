const fs = require('fs');
const path = require('path');

const ALLOWED_MIME = new Set(['image/jpeg', 'image/png', 'image/webp']);
const MAX_BYTES = 10 * 1024 * 1024;

/**
 * Detect real image type from file header (magic bytes). Returns null if unknown.
 */
function detectImageType(buffer) {
  if (!buffer || buffer.length < 12) return null;

  // JPEG: FF D8 FF
  if (buffer[0] === 0xff && buffer[1] === 0xd8 && buffer[2] === 0xff) {
    return 'image/jpeg';
  }

  // PNG: 89 50 4E 47 0D 0A 1A 0A
  if (
    buffer[0] === 0x89 &&
    buffer[1] === 0x50 &&
    buffer[2] === 0x4e &&
    buffer[3] === 0x47
  ) {
    return 'image/png';
  }

  // WebP: RIFF....WEBP
  if (
    buffer[0] === 0x52 &&
    buffer[1] === 0x49 &&
    buffer[2] === 0x46 &&
    buffer[3] === 0x46 &&
    buffer[8] === 0x57 &&
    buffer[9] === 0x45 &&
    buffer[10] === 0x42 &&
    buffer[11] === 0x50
  ) {
    return 'image/webp';
  }

  return null;
}

function extensionForMime(mime) {
  if (mime === 'image/png') return '.png';
  if (mime === 'image/webp') return '.webp';
  return '.jpg';
}

/**
 * Validate uploaded image: size, magic bytes, optional MIME match.
 * @returns {{ ok: boolean, mime?: string, error?: string }}
 */
function validateImageFile(filePath, declaredMime) {
  if (!filePath || !fs.existsSync(filePath)) {
    return { ok: false, error: 'Image file not found' };
  }

  const stat = fs.statSync(filePath);
  if (stat.size === 0) {
    return { ok: false, error: 'Empty image file' };
  }
  if (stat.size > MAX_BYTES) {
    return { ok: false, error: 'Image exceeds maximum size (10MB)' };
  }

  const fd = fs.openSync(filePath, 'r');
  try {
    const header = Buffer.alloc(16);
    fs.readSync(fd, header, 0, 16, 0);
    const detected = detectImageType(header);
    if (!detected || !ALLOWED_MIME.has(detected)) {
      return { ok: false, error: 'Only JPEG, PNG and WebP images are allowed' };
    }
    if (declaredMime && !ALLOWED_MIME.has(declaredMime)) {
      return { ok: false, error: 'Invalid image content type' };
    }
    return { ok: true, mime: detected };
  } finally {
    fs.closeSync(fd);
  }
}

/**
 * Re-encode image to strip EXIF/metadata. Falls back to validation-only if sharp unavailable.
 * @returns {Promise<{ ok: boolean, path: string, error?: string }>}
 */
async function sanitizeImageFile(filePath) {
  const validation = validateImageFile(filePath);
  if (!validation.ok) {
    return { ok: false, path: filePath, error: validation.error };
  }

  let sharp;
  try {
    sharp = require('sharp');
  } catch (_) {
    // sharp optional — validation still applied
    return { ok: true, path: filePath };
  }

  try {
    const mime = validation.mime;
    const dir = path.dirname(filePath);
    const base = path.basename(filePath, path.extname(filePath));
    const safePath = path.join(dir, `${base}-safe${extensionForMime(mime)}`);

    let pipeline = sharp(filePath, { failOn: 'error' }).rotate();

    if (mime === 'image/jpeg') {
      pipeline = pipeline.jpeg({ quality: 90, mozjpeg: true });
    } else if (mime === 'image/png') {
      pipeline = pipeline.png();
    } else if (mime === 'image/webp') {
      pipeline = pipeline.webp({ quality: 90 });
    }

    await pipeline.toFile(safePath);

    if (safePath !== filePath && fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
    }

    return { ok: true, path: safePath };
  } catch (err) {
    return {
      ok: false,
      path: filePath,
      error: err.message || 'Failed to process image safely',
    };
  }
}

module.exports = {
  ALLOWED_MIME,
  MAX_BYTES,
  detectImageType,
  validateImageFile,
  sanitizeImageFile,
};
