const EDGE_NOISE = /^[\s\u200B]+|[\s\u200B]+$/g;

export function normalizeKey(key: string): string {
  return key.replace(EDGE_NOISE, "").toLowerCase();
}
