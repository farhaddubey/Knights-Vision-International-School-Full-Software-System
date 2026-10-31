export function normalizeCarouselImageUrl(value) {
  if (value === null || value === undefined || value === "") return null;
  const url = String(value).trim();
  if (!url) return null;

  if (/^\/api\/media\/files\/\d+$/.test(url)) return url;
  try {
    const parsed = new URL(url);
    if (parsed.protocol === "http:" || parsed.protocol === "https:") return parsed.toString();
  } catch {
    // The route below returns a stable client-visible validation error.
  }
  throw new Error("Image URL must be a public http(s) URL or a selected library image.");
}

export function requiredCarouselImageUrl(value) {
  const url = normalizeCarouselImageUrl(value);
  if (!url) throw new Error("An image is required.");
  return url;
}
