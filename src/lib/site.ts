/** Public origin of the deployed site. Set NEXT_PUBLIC_SITE_URL in production. */
export const SITE_URL = (
  process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000"
).replace(/\/$/, "");

/**
 * Opalina is a fictional clinic: keep search engines away until the page is
 * adapted for a real client. Set NEXT_PUBLIC_ALLOW_INDEXING=true to index.
 */
export const ALLOW_INDEXING = process.env.NEXT_PUBLIC_ALLOW_INDEXING === "true";
