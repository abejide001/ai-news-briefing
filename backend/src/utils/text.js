export function extractHref(value = "") {
  const match = String(value).match(/href=["']([^"']+)["']/i);
  return match?.[1] || null;
}

export function stripHtml(value = "") {
  return String(value).replace(/<[^>]*>/g, "").trim();
}

export function decodeHtmlEntities(value = "") {
  return String(value)
    .replace(/&amp;/g, "&")
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&apos;/g, "'")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">");
}

export function cleanText(value = "") {
  return decodeHtmlEntities(stripHtml(value)).replace(/\s+/g, " ").trim();
}
