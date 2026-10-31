import { randomUUID } from "crypto";
import { DeleteObjectCommand, GetObjectCommand, PutObjectCommand } from "@aws-sdk/client-s3";
import sharp from "sharp";
import s3Client, { bucketName } from "@/src/lib/s3";

export const MEDIA_ROOT = "school-media";
export const MAX_UPLOAD_BYTES = 12 * 1024 * 1024;

const acceptedMimeTypes = new Set([
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/gif",
]);

function safeFolder(value) {
  const normalized = String(value || "library")
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");

  return normalized.slice(0, 48) || "library";
}

function safeName(value) {
  const name = String(value || "image")
    .replace(/[^a-zA-Z0-9._-]+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-+|-+$/g, "");

  return name.slice(0, 180) || "image";
}

export function normalizeVisibility(value) {
  return String(value || "private").toLowerCase() === "public" ? "public" : "private";
}

export function isManagedBackblazeMedia(file) {
  return Boolean(file?.folder_path?.startsWith(`${MEDIA_ROOT}/`));
}

export function mediaVisibility(file) {
  if (!isManagedBackblazeMedia(file)) return "legacy";
  return file.folder_path.startsWith(`${MEDIA_ROOT}/public/`) ? "public" : "private";
}

export function mediaApiUrl(fileId) {
  return `/api/media/files/${fileId}`;
}

async function optimizeWebp(source, {
  width = 1920,
  height = 1920,
  fit = "inside",
  withoutEnlargement = true,
  maxOutputBytes = 5 * 1024 * 1024,
  initialQuality = 86,
  minimumQuality = 42,
} = {}) {
  let optimized = null;
  for (let quality = initialQuality; quality >= minimumQuality; quality -= 8) {
    try {
      optimized = await sharp(source, { limitInputPixels: 40_000_000 })
        .rotate()
        .resize({ width, height, fit, withoutEnlargement })
        .webp({ quality, effort: 4 })
        .toBuffer();
    } catch {
      throw new Error("The selected file is not a valid image.");
    }
    if (optimized.length <= maxOutputBytes) return optimized;
  }
  const sizeLabel = maxOutputBytes <= 100 * 1024 ? "100 KB" : "the permitted size";
  throw new Error(`The optimized image is too large. It must be below ${sizeLabel}.`);
}

/**
 * Stores a display-ready image.  The original browser upload never receives a
 * storage credential; only this server module talks to Backblaze.
 */
export async function storeSchoolMedia({ file, visibility, folder = "library", transform = null }) {
  if (!file || typeof file.arrayBuffer !== "function") {
    throw new Error("An image file is required.");
  }
  if (!acceptedMimeTypes.has(file.type)) {
    throw new Error("Use a JPEG, PNG, WebP, or GIF image.");
  }
  if (file.size <= 0 || file.size > MAX_UPLOAD_BYTES) {
    throw new Error("Images must be between 1 byte and 12 MB.");
  }

  const source = Buffer.from(await file.arrayBuffer());
  const optimized = await optimizeWebp(source, transform || undefined);

  const access = normalizeVisibility(visibility);
  const now = new Date();
  const key = [
    MEDIA_ROOT,
    access,
    safeFolder(folder),
    String(now.getUTCFullYear()),
    String(now.getUTCMonth() + 1).padStart(2, "0"),
    `${randomUUID()}-${safeName(file.name).replace(/\.[^.]+$/, "")}.webp`,
  ].join("/");

  await s3Client.send(new PutObjectCommand({
    Bucket: bucketName,
    Key: key,
    Body: optimized,
    ContentType: "image/webp",
    CacheControl: access === "public" ? "public, max-age=31536000, immutable" : "private, max-age=86400",
  }));

  return {
    key,
    folderPath: `${MEDIA_ROOT}/${access}/${safeFolder(folder)}`,
    name: safeName(file.name),
    mime: "image/webp",
    sizeKb: Number((optimized.length / 1024).toFixed(2)),
    visibility: access,
  };
}

export async function removeSchoolMedia(file) {
  if (!isManagedBackblazeMedia(file)) {
    const error = new Error("This legacy file remains on its original storage provider and cannot be deleted from the new media library.");
    error.code = "LEGACY_MEDIA";
    throw error;
  }

  await s3Client.send(new DeleteObjectCommand({ Bucket: bucketName, Key: file.key }));
}

export async function readSchoolMedia(file) {
  if (!isManagedBackblazeMedia(file)) {
    const error = new Error("This file is not managed by Backblaze media storage.");
    error.code = "LEGACY_MEDIA";
    throw error;
  }

  const response = await s3Client.send(new GetObjectCommand({ Bucket: bucketName, Key: file.key }));
  return {
    content: await response.Body.transformToByteArray(),
    contentType: response.ContentType || file.mime || "image/webp",
  };
}
